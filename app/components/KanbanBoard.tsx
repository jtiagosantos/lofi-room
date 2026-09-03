"use client";

import { X, Plus, Trash2, Pencil, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type Task = {
  id: string;
  content: string;
};

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

type Props = {
  onClose: () => void;
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function KanbanBoard({ onClose }: Props) {
  const [columns, setColumns] = useState<Column[]>([]);

  // Column creation
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  // Column editing
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState("");

  // Task creation
  const [addingTaskInColumn, setAddingTaskInColumn] = useState<string | null>(null);
  const [newTaskContent, setNewTaskContent] = useState("");

  // Task editing
  const [editingTask, setEditingTask] = useState<{ colId: string; taskId: string } | null>(null);
  const [editingTaskContent, setEditingTaskContent] = useState("");

  // Drag & drop
  const dragging = useRef<{ colId: string; taskId: string } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // --- Column actions ---
  function addColumn() {
    const title = newColumnTitle.trim();
    if (!title) return;
    setColumns((cols) => [...cols, { id: uid(), title, tasks: [] }]);
    setNewColumnTitle("");
    setAddingColumn(false);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ left: scrollRef.current.scrollWidth, behavior: "smooth" });
    }, 50);
  }

  function deleteColumn(colId: string) {
    setColumns((cols) => cols.filter((c) => c.id !== colId));
  }

  function startEditColumn(col: Column) {
    setEditingColumnId(col.id);
    setEditingColumnTitle(col.title);
  }

  function saveEditColumn(colId: string) {
    const title = editingColumnTitle.trim();
    if (!title) return;
    setColumns((cols) => cols.map((c) => (c.id === colId ? { ...c, title } : c)));
    setEditingColumnId(null);
  }

  // --- Task actions ---
  function addTask(colId: string) {
    const content = newTaskContent.trim();
    if (!content) return;
    setColumns((cols) =>
      cols.map((c) =>
        c.id === colId ? { ...c, tasks: [...c.tasks, { id: uid(), content }] } : c
      )
    );
    setNewTaskContent("");
    setAddingTaskInColumn(null);
  }

  function deleteTask(colId: string, taskId: string) {
    setColumns((cols) =>
      cols.map((c) =>
        c.id === colId ? { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) } : c
      )
    );
  }

  function startEditTask(colId: string, task: Task) {
    setEditingTask({ colId, taskId: task.id });
    setEditingTaskContent(task.content);
  }

  function saveEditTask() {
    if (!editingTask) return;
    const content = editingTaskContent.trim();
    if (!content) return;
    setColumns((cols) =>
      cols.map((c) =>
        c.id === editingTask.colId
          ? {
              ...c,
              tasks: c.tasks.map((t) =>
                t.id === editingTask.taskId ? { ...t, content } : t
              ),
            }
          : c
      )
    );
    setEditingTask(null);
  }

  // --- Drag & drop ---
  function onDragStart(colId: string, taskId: string) {
    dragging.current = { colId, taskId };
  }

  function onDropColumn(targetColId: string) {
    if (!dragging.current) return;
    const { colId: srcColId, taskId } = dragging.current;
    if (srcColId === targetColId) return;

    setColumns((cols) => {
      const task = cols.find((c) => c.id === srcColId)?.tasks.find((t) => t.id === taskId);
      if (!task) return cols;
      return cols.map((c) => {
        if (c.id === srcColId) return { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) };
        if (c.id === targetColId) return { ...c, tasks: [...c.tasks, task] };
        return c;
      });
    });
    dragging.current = null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Board */}
      <div
        className="kanban-enter fixed z-50 flex flex-col"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(90vw, 900px)",
          maxHeight: "80vh",
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "20px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}
      >
        <style>{`
          @keyframes kanban-in {
            from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
            to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
          .kanban-enter {
            animation: kanban-in 0.2s ease-out forwards;
          }
          .task-card:hover .task-actions { opacity: 1; }
          .col-scroll::-webkit-scrollbar { width: 4px; }
          .col-scroll::-webkit-scrollbar-track { background: transparent; }
          .col-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
          .board-scroll::-webkit-scrollbar { height: 6px; }
          .board-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
          .board-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        `}</style>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-white font-semibold text-base tracking-wide">Board de tarefas</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Columns */}
        <div
          ref={scrollRef}
          className="board-scroll flex gap-3 overflow-x-auto p-4 flex-1"
          style={{ minHeight: 0 }}
          onDragOver={(e) => e.preventDefault()}
        >
          {columns.map((col) => (
            <div
              key={col.id}
              className="flex flex-col flex-shrink-0 rounded-2xl"
              style={{
                width: 240,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDropColumn(col.id)}
            >
              {/* Column header */}
              <div className="flex items-center gap-1 px-3 pt-3 pb-2 flex-shrink-0">
                {editingColumnId === col.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      autoFocus
                      className="flex-1 bg-transparent text-white text-sm font-medium outline-none border-b border-white/30 pb-0.5"
                      value={editingColumnTitle}
                      onChange={(e) => setEditingColumnTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEditColumn(col.id);
                        if (e.key === "Escape") setEditingColumnId(null);
                      }}
                    />
                    <button
                      onClick={() => saveEditColumn(col.id)}
                      className="text-white/50 hover:text-white cursor-pointer"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-white/80 text-sm font-medium truncate">
                      {col.title}
                    </span>
                    <button
                      onClick={() => startEditColumn(col)}
                      className="text-white/30 hover:text-white/70 cursor-pointer p-0.5"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => deleteColumn(col.id)}
                      className="text-white/30 hover:text-red-400 cursor-pointer p-0.5"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>

              {/* Tasks */}
              <div className="col-scroll flex flex-col gap-2 px-3 overflow-y-auto" style={{ maxHeight: 340 }}>
                {col.tasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => onDragStart(col.id, task.id)}
                    className="task-card group relative rounded-xl px-3 py-2.5 cursor-move"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {editingTask?.colId === col.id && editingTask?.taskId === task.id ? (
                      <div className="flex flex-col gap-1.5">
                        <textarea
                          autoFocus
                          rows={3}
                          className="w-full bg-transparent text-white/90 text-xs outline-none resize-none"
                          value={editingTaskContent}
                          onChange={(e) => setEditingTaskContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              saveEditTask();
                            }
                            if (e.key === "Escape") setEditingTask(null);
                          }}
                        />
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={saveEditTask}
                            className="text-white/50 hover:text-white cursor-pointer"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-white/80 text-xs leading-relaxed break-words w-full pr-14">{task.content}</p>
                        <div className="task-actions opacity-0 transition-opacity absolute top-2 right-2 flex gap-1.5">
                          <button
                            onClick={() => startEditTask(col.id, task)}
                            className="text-white/40 hover:text-white cursor-pointer"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            onClick={() => deleteTask(col.id, task.id)}
                            className="text-white/40 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add task */}
              <div className="px-3 py-2.5 flex-shrink-0">
                {addingTaskInColumn === col.id ? (
                  <div className="flex flex-col gap-1.5">
                    <textarea
                      autoFocus
                      rows={2}
                      placeholder="Descrição da tarefa..."
                      className="w-full rounded-lg px-2.5 py-2 text-xs text-white/90 placeholder-white/30 outline-none resize-none"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                      value={newTaskContent}
                      onChange={(e) => setNewTaskContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          addTask(col.id);
                        }
                        if (e.key === "Escape") {
                          setAddingTaskInColumn(null);
                          setNewTaskContent("");
                        }
                      }}
                    />
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => addTask(col.id)}
                        className="flex-1 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                      >
                        Adicionar
                      </button>
                      <button
                        onClick={() => { setAddingTaskInColumn(null); setNewTaskContent(""); }}
                        className="px-2 py-1 rounded-lg text-xs text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAddingTaskInColumn(col.id); setNewTaskContent(""); }}
                    className="flex items-center gap-1.5 text-white/30 hover:text-white/70 text-xs transition-colors cursor-pointer w-full"
                  >
                    <Plus size={16} />
                    Adicionar tarefa
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add column */}
          <div className="flex-shrink-0" style={{ width: 240 }}>
            {addingColumn ? (
              <div
                className="rounded-2xl px-3 py-3 flex flex-col gap-2"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <input
                  autoFocus
                  placeholder="Nome da coluna..."
                  className="bg-transparent text-white text-sm outline-none border-b border-white/20 pb-1 placeholder-white/30"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addColumn();
                    if (e.key === "Escape") { setAddingColumn(false); setNewColumnTitle(""); }
                  }}
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={addColumn}
                    className="flex-1 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    Criar coluna
                  </button>
                  <button
                    onClick={() => { setAddingColumn(false); setNewColumnTitle(""); }}
                    className="px-2 py-1 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingColumn(true)}
                className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-white/30 hover:text-white/60 text-sm transition-colors cursor-pointer"
                style={{ border: "1px dashed rgba(255,255,255,0.15)" }}
              >
                <Plus size={18} />
                Nova coluna
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
