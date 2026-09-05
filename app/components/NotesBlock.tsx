"use client";

import { X, Plus, Trash2, Pencil, Check, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

export type Note = {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
};

type Props = {
  onClose: () => void;
  initialNotes?: Note[] | null;
  onNotesChange?: (notes: Note[]) => void;
};

export default function NotesBlock({ onClose, initialNotes, onNotesChange }: Props) {
  const [notes, setNotes] = useState<Note[]>(initialNotes ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialNotes);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedNote = notes.find((n) => n._id === selectedId) ?? null;

  // Sincronizar notas com o componente pai
  useEffect(() => {
    onNotesChange?.(notes);
  }, [notes, onNotesChange]);

  // Carregar notas do banco apenas se não foram pré-carregadas
  useEffect(() => {
    if (initialNotes) return;

    async function fetchNotes() {
      try {
        const res = await fetch("/api/notes");
        if (res.ok) {
          const data = await res.json();
          setNotes(data);
        }
      } catch (err) {
        console.error("Erro ao carregar notas:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, [initialNotes]);

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

  // Salvar conteúdo com debounce
  const saveContent = useCallback(async (id: string, content: string) => {
    setSaving(true);
    try {
      await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, content }),
      });
    } catch (err) {
      console.error("Erro ao salvar conteúdo:", err);
    } finally {
      setSaving(false);
    }
  }, []);

  async function createNote() {
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Nova anotação", content: "" }),
      });
      if (res.ok) {
        const note = await res.json();
        setNotes((prev) => [note, ...prev]);
        setSelectedId(note._id);
      }
    } catch (err) {
      console.error("Erro ao criar nota:", err);
    }
  }

  async function deleteNote(id: string) {
    try {
      await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotes((prev) => prev.filter((n) => n._id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      console.error("Erro ao deletar nota:", err);
    }
    setConfirmDeleteId(null);
  }

  function updateContent(id: string, content: string) {
    setNotes((prev) => prev.map((n) => (n._id === id ? { ...n, content } : n)));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveContent(id, content);
    }, 500);
  }

  function startEditTitle(note: Note) {
    setEditingTitleId(note._id);
    setEditingTitle(note.title);
  }

  async function saveTitle(id: string) {
    const title = editingTitle.trim() || "Sem título";
    setNotes((prev) => prev.map((n) => (n._id === id ? { ...n, title } : n)));
    setEditingTitleId(null);

    try {
      await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title }),
      });
    } catch (err) {
      console.error("Erro ao salvar título:", err);
    }
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
          <div className="flex items-center gap-2">
            <h2 className="text-white font-semibold text-base tracking-wide">Bloco de anotações</h2>
            {saving && <Loader2 size={14} className="text-white/30 animate-spin" />}
          </div>
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
              {loading ? (
                <div className="flex items-center justify-center mt-6">
                  <Loader2 size={18} className="text-white/30 animate-spin" />
                </div>
              ) : notes.length === 0 ? (
                <p className="text-white/25 text-xs text-center mt-6 px-4 leading-relaxed">
                  Nenhuma anotação ainda
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note._id}
                    onClick={() => setSelectedId(note._id)}
                    className="note-item group relative flex items-center gap-1 px-3 py-2.5 rounded-xl cursor-pointer transition-colors mb-1"
                    style={{
                      background: selectedId === note._id ? "rgba(255,255,255,0.1)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedId !== note._id)
                        (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (selectedId !== note._id)
                        (e.currentTarget as HTMLDivElement).style.background = "transparent";
                    }}
                  >
                    <>
                      <span className="flex-1 text-white/80 text-sm truncate">{note.title}</span>
                      <div className="note-actions opacity-0 transition-opacity flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(note._id); }}
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
                  {editingTitleId === selectedNote._id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        autoFocus
                        className="flex-1 bg-transparent text-white font-medium outline-none border-b border-white/30 pb-0.5"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveTitle(selectedNote._id);
                          if (e.key === "Escape") setEditingTitleId(null);
                        }}
                        onBlur={() => saveTitle(selectedNote._id)}
                      />
                      <button
                        onClick={() => saveTitle(selectedNote._id)}
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
                  onChange={(e) => updateContent(selectedNote._id, e.target.value)}
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
