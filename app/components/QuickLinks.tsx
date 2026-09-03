"use client";

import { X, Plus, Trash2, Pencil, Check, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

const STORAGE_KEY = "lofi-room:quick-links";

type Link = {
  id: string;
  label: string;
  url: string;
};

type Props = {
  onClose: () => void;
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

function getDomain(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function getFaviconUrl(url: string): string {
  const domain = getDomain(url);
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

export default function QuickLinks({ onClose }: Props) {
  const [links, setLinks] = useState<Link[]>([]);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editUrl, setEditUrl] = useState("");

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setLinks(JSON.parse(saved));
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function addLink() {
    const url = newUrl.trim();
    const label = newLabel.trim() || getDomain(url);
    if (!url) return;
    setLinks((prev) => [...prev, { id: uid(), label, url }]);
    setNewLabel("");
    setNewUrl("");
    setAdding(false);
  }

  function deleteLink(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  function startEdit(link: Link) {
    setEditingId(link.id);
    setEditLabel(link.label);
    setEditUrl(link.url);
  }

  function saveEdit() {
    if (!editingId) return;
    const url = editUrl.trim();
    const label = editLabel.trim() || getDomain(url);
    if (!url) return;
    setLinks((prev) => prev.map((l) => l.id === editingId ? { ...l, label, url } : l));
    setEditingId(null);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="quicklinks-enter fixed z-50 flex flex-col overflow-hidden"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(90vw, 480px)",
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
          @keyframes quicklinks-in {
            from { opacity: 0; transform: translate(-50%, -48%) scale(0.97); }
            to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
          .quicklinks-enter {
            animation: quicklinks-in 0.2s ease-out forwards;
          }
          .links-scroll::-webkit-scrollbar { width: 4px; }
          .links-scroll::-webkit-scrollbar-track { background: transparent; }
          .links-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
          .link-item:hover .link-actions { opacity: 1; }
        `}</style>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-white font-semibold text-base tracking-wide">Links rápidos</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Links list */}
        <div className="links-scroll flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {links.length === 0 && !adding && (
            <p className="text-white/25 text-xs text-center py-8">Nenhum link salvo ainda</p>
          )}

          {links.map((link) => (
            <div
              key={link.id}
              className="link-item group flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {editingId === link.id ? (
                <div className="flex flex-col gap-2 flex-1">
                  <input
                    autoFocus
                    placeholder="Nome do link"
                    className="bg-transparent text-white text-sm outline-none border-b border-white/20 pb-0.5 placeholder-white/25"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingId(null); }}
                  />
                  <input
                    placeholder="URL (ex: github.com)"
                    className="bg-transparent text-white/70 text-xs outline-none border-b border-white/20 pb-0.5 placeholder-white/25"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingId(null); }}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="text-white/30 hover:text-white/60 text-xs cursor-pointer">Cancelar</button>
                    <button onClick={saveEdit} className="text-white/60 hover:text-white cursor-pointer"><Check size={14} /></button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Favicon */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getFaviconUrl(link.url)}
                    alt=""
                    className="w-5 h-5 rounded flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />

                  {/* Label + URL */}
                  <a
                    href={normalizeUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex flex-col gap-0.5 min-w-0 group/link"
                  >
                    <span className="text-white/85 text-sm truncate group-hover/link:text-white transition-colors">{link.label}</span>
                    <span className="text-white/35 text-xs truncate">{getDomain(link.url)}</span>
                  </a>

                  {/* Open + actions */}
                  <div className="link-actions opacity-0 transition-opacity flex items-center gap-1.5">
                    <a
                      href={normalizeUrl(link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/35 hover:text-white cursor-pointer transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button onClick={() => startEdit(link)} className="text-white/35 hover:text-white cursor-pointer transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => deleteLink(link.id)} className="text-white/35 hover:text-red-400 cursor-pointer transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add form */}
          {adding && (
            <div
              className="flex flex-col gap-2 px-3 py-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <input
                autoFocus
                placeholder="Nome do link (opcional)"
                className="bg-transparent text-white text-sm outline-none border-b border-white/20 pb-1 placeholder-white/25"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") document.getElementById("new-url-input")?.focus(); if (e.key === "Escape") { setAdding(false); setNewLabel(""); setNewUrl(""); } }}
              />
              <input
                id="new-url-input"
                placeholder="URL (ex: github.com)"
                className="bg-transparent text-white/70 text-xs outline-none border-b border-white/20 pb-1 placeholder-white/25"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addLink(); if (e.key === "Escape") { setAdding(false); setNewLabel(""); setNewUrl(""); } }}
              />
              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={() => { setAdding(false); setNewLabel(""); setNewUrl(""); }}
                  className="text-white/30 hover:text-white/60 text-xs cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addLink}
                  className="flex items-center gap-1 text-white/60 hover:text-white text-xs cursor-pointer transition-colors"
                >
                  <Check size={13} /> Salvar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - add button */}
        <div
          className="px-4 py-3 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <button
            onClick={() => { setAdding(true); setNewLabel(""); setNewUrl(""); }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-sm"
          >
            <Plus size={16} />
            Adicionar link
          </button>
        </div>
      </div>
    </>
  );
}
