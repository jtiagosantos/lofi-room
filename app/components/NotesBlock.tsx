"use client";

import { X, Plus, Trash2, Pencil, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
};

type Props = {
  onClose: () => void;
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function NotesBlock({ onClose }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Focus textarea when selecting a note
  useEffect(() => {
    if (selectedId) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [selectedId]);

  function createNote() {
    const note: Note = {
      id: uid(),
      title: "Nova anotação",
      content: "",
      createdAt: new Date(),
    };
    setNotes((prev) => [note, ...prev]);
    setSelectedId(note.id);
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
    setConfirmDeleteId(null);
  }

  function updateContent(id: string, content: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, content } : n)));
  }

  function startEditTitle(note: Note) {
    setEditingTitleId(note.id);
    setEditingTitle(note.title);
  }

  function saveTitle(id: string) {
    const title = editingTitle.trim() || "Sem título";
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, title } : n)));
    setEditingTitleId(null);
  }

  return (
    <div style={{ display: "contents" }}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="notes-enter fixed z-50 flex flex-col overflow-hidden"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(90vw, 780px)",
          height: "min(85vh, 560px)",
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
          <h2 className="text-white font-semibold text-base tracking-wide">Bloco de anotações</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar - note list */}
          <div
            className="flex flex-col flex-shrink-0 overflow-hidden"
            style={{
              width: 220,
              borderRight: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* New note button */}
            <div className="px-3 py-2.5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={createNote}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-sm"
              >
                <Plus size={16} />
                Nova anotação
              </button>
            </div>

            {/* List */}
            <div className="notes-scroll flex-1 overflow-y-auto py-2 px-2">
              {notes.length === 0 ? (
                <p className="text-white/25 text-xs text-center mt-6 px-4 leading-relaxed">
                  Nenhuma anotação ainda
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setSelectedId(note.id)}
                    className="note-item group relative flex items-center gap-1 px-3 py-2.5 rounded-xl cursor-pointer transition-colors mb-1"
                    style={{
                      background: selectedId === note.id ? "rgba(255,255,255,0.1)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedId !== note.id)
                        (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (selectedId !== note.id)
                        (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    }}
                  >
                    <>
                      <span className="flex-1 text-white/80 text-sm truncate">{note.title}</span>
                      <div className="note-actions opacity-0 transition-opacity flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(note.id); }}
                          className="text-white/40 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedNote ? (
              <>
                {/* Note title bar */}
                <div
                  className="flex items-center gap-2 px-5 py-3 flex-shrink-0"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  {editingTitleId === selectedNote.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        autoFocus
                        className="flex-1 bg-transparent text-white font-medium outline-none border-b border-white/30 pb-0.5"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveTitle(selectedNote.id);
                          if (e.key === "Escape") setEditingTitleId(null);
                        }}
                        onBlur={() => saveTitle(selectedNote.id)}
                      />
                      <button
                        onClick={() => saveTitle(selectedNote.id)}
                        className="text-white/50 hover:text-white cursor-pointer"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="flex-1 text-white font-medium truncate">{selectedNote.title}</span>
                      <button
                        onClick={() => startEditTitle(selectedNote)}
                        className="text-white/30 hover:text-white/70 cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  className="notes-textarea flex-1 bg-transparent text-white/80 text-sm leading-relaxed resize-none outline-none px-5 py-4 overflow-y-auto placeholder-white/20"
                  placeholder="Escreva sua anotação..."
                  value={selectedNote.content}
                  onChange={(e) => updateContent(selectedNote.id, e.target.value)}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <p className="text-white/25 text-sm">Selecione ou crie uma anotação</p>
                <button
                  onClick={createNote}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-sm"
                  style={{ border: "1px dashed rgba(255,255,255,0.15)" }}
                >
                  <Plus size={15} />
                  Nova anotação
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Confirm delete modal */}
        {confirmDeleteId && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-[20px]"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          >
            <div
              className="flex flex-col gap-4 px-6 py-5 rounded-2xl"
              style={{
                background: "rgba(30,30,30,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
              }}
            >
              <p className="text-white/80 text-sm">Deletar esta anotação?</p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-1.5 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => deleteNote(confirmDeleteId)}
                  className="px-4 py-1.5 rounded-lg text-xs text-white bg-red-500/70 hover:bg-red-500/90 transition-colors cursor-pointer"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
