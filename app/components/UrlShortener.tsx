"use client";

import { X, Scissors, Copy, Check, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

type ShortenedUrl = {
  id: string;
  original: string;
  short: string;
};

type Props = {
  onClose: () => void;
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function UrlShortener({ onClose }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ShortenedUrl[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function shortenUrl() {
    const trimmed = url.trim();
    if (!trimmed) return;

    const normalized = trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://is.gd/create.php?format=json&url=${encodeURIComponent(normalized)}`
      );
      const data = await res.json();

      if (data.errorcode) {
        setError(data.errormessage || "Erro ao encurtar URL.");
        setLoading(false);
        return;
      }

      const entry: ShortenedUrl = {
        id: uid(),
        original: normalized,
        short: data.shorturl,
      };

      setHistory((prev) => [entry, ...prev]);
      setUrl("");
      copyToClipboard(entry.id, entry.short);
    } catch {
      setError("Erro ao encurtar URL. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
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
        className="urlshort-enter fixed z-50 flex flex-col overflow-hidden"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(90vw, 460px)",
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
          <h2 className="text-white font-semibold text-base tracking-wide">Encurtador de URL</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-5">
          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cole a URL aqui (ex: github.com/user/repo)"
              className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none px-3 py-2.5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") shortenUrl(); }}
            />
            <button
              onClick={shortenUrl}
              disabled={loading || !url.trim()}
              className="flex items-center justify-center w-11 h-11 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ border: "1px solid rgba(255,255,255,0.12)" }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
              ) : (
                <Scissors size={17} />
              )}
            </button>
          </div>

          {/* Error */}
          {error && <p className="text-red-400/80 text-xs px-1">{error}</p>}

          {/* History */}
          {history.length > 0 && (
            <div className="urlshort-scroll flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 300 }}>
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-1.5 px-3 py-2.5 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {/* Original URL */}
                  <span className="text-white/35 text-xs truncate">{entry.original}</span>

                  {/* Short URL + actions */}
                  <div className="flex items-center gap-2">
                    <span className="text-white/85 text-sm flex-1 truncate">{entry.short}</span>
                    <button
                      onClick={() => copyToClipboard(entry.id, entry.short)}
                      className="text-white/40 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                    >
                      {copiedId === entry.id ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                    </button>
                    <a
                      href={entry.short}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/40 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {history.length === 0 && !error && (
            <p className="text-white/20 text-xs text-center py-4">Cole uma URL e clique para encurtar</p>
          )}
        </div>
      </div>
    </div>
  );
}
