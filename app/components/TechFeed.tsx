"use client";

import { X, ExternalLink, RefreshCw, Heart, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

type Article = {
  id: number;
  title: string;
  url: string;
  positive_reactions_count: number;
  comments_count: number;
  user: {
    name: string;
    profile_image_90: string;
  };
  readable_publish_date: string;
  tag_list: string[];
  reading_time_minutes: number;
};

type Props = {
  onClose: () => void;
};

export default function TechFeed({ onClose }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://dev.to/api/articles?top=1&per_page=30");
      const data: Article[] = await res.json();
      setArticles(data);
    } catch {
      setError("Erro ao carregar artigos.");
    } finally {
      setLoading(false);
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
        className="techfeed-enter fixed z-50 flex flex-col overflow-hidden"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(90vw, 560px)",
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
          <h2 className="text-white font-semibold text-base tracking-wide">Tech Feed</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchArticles}
              disabled={loading}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="feed-scroll flex-1 overflow-y-auto">
          {loading && articles.length === 0 && (
            <div className="flex justify-center py-12">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 py-12">
              <p className="text-red-400/70 text-xs">{error}</p>
              <button
                onClick={fetchArticles}
                className="text-white/50 hover:text-white text-xs cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <p className="text-white/25 text-xs text-center py-12">Nenhum artigo encontrado</p>
          )}

          {articles.map((article, i) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 px-5 py-3.5 transition-colors group"
              style={{
                borderBottom: i < articles.length - 1 ? "1px solid rgba(255,255,255,0.05)" : undefined,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              }}
            >
              {/* Avatar */}
              <img
                src={article.user.profile_image_90}
                alt={article.user.name}
                className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5"
              />

              {/* Content */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <span className="text-white/85 text-sm leading-snug group-hover:text-white transition-colors">
                  {article.title}
                </span>

                {/* Tags */}
                {article.tag_list.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {article.tag_list.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-white/25 text-xs px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 text-white/30 text-xs">
                  <span>{article.user.name}</span>
                  <span>{article.readable_publish_date}</span>
                  <span className="flex items-center gap-0.5">
                    <Heart size={10} />
                    {article.positive_reactions_count}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MessageCircle size={10} />
                    {article.comments_count}
                  </span>
                  <span>{article.reading_time_minutes} min</span>
                </div>
              </div>

              {/* External link icon */}
              <ExternalLink size={12} className="text-white/15 group-hover:text-white/40 transition-colors flex-shrink-0 mt-1" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
