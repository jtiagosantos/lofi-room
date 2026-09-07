"use client";

import { X, Plus, Trash2, Pencil, Check, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

export type BoardTask = {
  _id: string;
  content: string;
};

export type BoardColumn = {
  _id: string;
  title: string;
  tasks: BoardTask[];
};

type Props = {
  onClose: () => void;
  initialBoard?: BoardColumn[] | null;
  onBoardChange?: (columns: BoardColumn[]) => void;
};

function uid() {
  return Math.random().toString(36).slice(2, 12);
}

export default function KanbanBoard({ onClose, initialBoard, onBoardChange }: Props) {
  const [columns, setColumns] = useState<BoardColumn[]>(initialBoard ?? []);
  const [loading, setLoading] = useState(!initialBoard);

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sincronizar board com o componente pai
  useEffect(() => {
    onBoardChange?.(columns);
  }, [columns, onBoardChange]);

  // Carregar board do banco apenas se não foi pré-carregado
  useEffect(() => {
    if (initialBoard) return;

    async function fetchBoard() {
      try {
        const res = await fetch("/api/tasks-board");
        if (res.ok) {
          const data = await res.json();
          setColumns(data.columns);
        }
      } catch (err) {
        console.error("Erro ao carregar board:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBoard();
  }, [initialBoard]);

  // Salvar board no banco com debounce
  const saveBoard = useCallback((updatedColumns: BoardColumn[]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch("/api/tasks-board", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columns: updatedColumns }),
      }).catch((err) => console.error("Erro ao salvar board:", err));
    }, 500);
  }, []);

  // Helper: atualizar columns e salvar
  function updateColumns(updater: (cols: BoardColumn[]) => BoardColumn[]) {
    setColumns((prev) => {
      const updated = updater(prev);
      saveBoard(updated);
      return updated;
    });
  }

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
    updateColumns((cols) => [...cols, { _id: uid(), title, tasks: [] }]);
    setNewColumnTitle("");
    setAddingColumn(false);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ left: scrollRef.current.scrollWidth, behavior: "smooth" });
    }, 50);
  }

  function deleteColumn(colId: string) {
    updateColumns((cols) => cols.filter((c) => c._id !== colId));
  }

  function startEditColumn(col: BoardColumn) {
    setEditingColumnId(col._id);
    setEditingColumnTitle(col.title);
  }

  function saveEditColumn(colId: string) {
    const title = editingColumnTitle.trim();
    if (!title) return;
    updateColumns((cols) => cols.map((c) => (c._id === colId ? { ...c, title } : c)));
    setEditingColumnId(null);
  }

  // --- Task actions ---
  function addTask(colId: string) {
    const content = newTaskContent.trim();
    if (!content) return;
    updateColumns((cols) =>
      cols.map((c) =>
        c._id === colId ? { ...c, tasks: [...c.tasks, { _id: uid(), content }] } : c
      )
    );
    setNewTaskContent("");
    setAddingTaskInColumn(null);
  }

  function deleteTask(colId: string, taskId: string) {
    updateColumns((cols) =>
      cols.map((c) =>
        c._id === colId ? { ...c, tasks: c.tasks.filter((t) => t._id !== taskId) } : c
      )
    );
  }

  function startEditTask(colId: string, task: BoardTask) {
    setEditingTask({ colId, taskId: task._id });
    setEditingTaskContent(task.content);
  }

  function saveEditTask() {
    if (!editingTask) return;
    const content = editingTaskContent.trim();
    if (!content) return;
    updateColumns((cols) =>
      cols.map((c) =>
        c._id === editingTask.colId
          ? {
              ...c,
              tasks: c.tasks.map((t) =>
                t._id === editingTask.taskId ? { ...t, content } : t
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

    updateColumns((cols) => {
      const task = cols.find((c) => c._id === srcColId)?.tasks.find((t) => t._id === taskId);
      if (!task) return cols;
      return cols.map((c) => {
        if (c._id === srcColId) return { ...c, tasks: c.tasks.filter((t) => t._id !== taskId) };
        if (c._id === targetColId) return { ...c, tasks: [...c.tasks, task] };
        return c;
      });
    });
    dragging.current = null;
  }

  return (
    <div style={{ display: "contents" }}>
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
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={18} className="text-white/30 animate-spin" />
          </div>
        ) : (
        <div
          ref={scrollRef}
          className="board-scroll flex gap-3 overflow-x-auto p-4 flex-1"
          style={{ minHeight: 0 }}
          onDragOver={(e) => e.preventDefault()}
        >
          {columns.map((col) => (
            <div
              key={col._id}
              className="flex flex-col flex-shrink-0 rounded-2xl"
              style={{
                width: 240,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDropColumn(col._id)}
            >
              {/* Column header */}
              <div className="flex items-center gap-1 px-3 pt-3 pb-2 flex-shrink-0">
                {editingColumnId === col._id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      autoFocus
                      className="flex-1 bg-transparent text-white text-sm font-medium outline-none border-b border-white/30 pb-0.5"
                      value={editingColumnTitle}
                      onChange={(e) => setEditingColumnTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEditColumn(col._id);
                        if (e.key === "Escape") setEditingColumnId(null);
                      }}
                    />
                    <button
                      onClick={() => saveEditColumn(col._id)}
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
                      onClick={() => deleteColumn(col._id)}
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
                    key={task._id}
                    draggable
                    onDragStart={() => onDragStart(col._id, task._id)}
                    className="task-card group relative rounded-xl px-3 py-2.5 cursor-move"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {editingTask?.colId === col._id && editingTask?.taskId === task._id ? (
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
                            onClick={() => startEditTask(col._id, task)}
                            className="text-white/40 hover:text-white cursor-pointer"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            onClick={() => deleteTask(col._id, task._id)}
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
                {addingTaskInColumn === col._id ? (
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
                          addTask(col._id);
                        }
                        if (e.key === "Escape") {
                          setAddingTaskInColumn(null);
                          setNewTaskContent("");
                        }
                      }}
                    />
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => addTask(col._id)}
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
                    onClick={() => { setAddingTaskInColumn(col._id); setNewTaskContent(""); }}
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
        )}
      </div>
    </div>
  );
}
