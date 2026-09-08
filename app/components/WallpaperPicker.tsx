"use client";

import { X, Search, Loader2, Check } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

type UnsplashImage = {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string | null;
  user: {
    name: string;
    links: {
      html: string;
    };
  };
};

type Props = {
  onClose: () => void;
  currentWallpaper: string;
  onWallpaperChange: (url: string) => void;
};

const UNSPLASH_ACCESS_KEY = "HhAZvTuJ-GH_HoykdDoxrDXdGNpP5Ba3HTcRnCQRMQw";

const CATEGORIES = [
  { label: "Lofi", query: "lofi aesthetic room" },
  { label: "Anime", query: "anime scenery aesthetic" },
  { label: "Natureza", query: "nature landscape scenic" },
  { label: "Cidade", query: "city night aesthetic" },
  { label: "Café", query: "cozy coffee shop" },
  { label: "Chuva", query: "rain window cozy" },
  { label: "Pixel Art", query: "pixel art wallpaper" },
  { label: "Noite", query: "night sky stars" },
];

export default function WallpaperPicker({ onClose, currentWallpaper, onWallpaperChange }: Props) {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("lofi aesthetic room");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchImages = useCallback(async (query: string, pageNum: number, append: boolean = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${pageNum}&per_page=20&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
      );
      if (res.ok) {
        const data = await res.json();
        const results = data.results as UnsplashImage[];
        setImages((prev) => append ? [...prev, ...results] : results);
        setHasMore(results.length === 20);
      }
    } catch (err) {
      console.error("Erro ao buscar imagens:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Carregar imagens iniciais
  useEffect(() => {
    fetchImages(activeCategory, 1);
  }, [activeCategory, fetchImages]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleSearch() {
    const query = searchQuery.trim();
    if (!query) return;
    setActiveCategory("");
    setPage(1);
    fetchImages(query, 1);
  }

  function handleCategoryClick(query: string) {
    setActiveCategory(query);
    setSearchQuery("");
    setPage(1);
    scrollRef.current?.scrollTo({ top: 0 });
  }

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    const query = activeCategory || searchQuery.trim();
    fetchImages(query, nextPage, true);
  }

  function saveWallpaperToDb(url: string) {
    fetch("/api/wallpapers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }).catch((err) => console.error("Erro ao salvar wallpaper:", err));
  }

  function selectWallpaper(image: UnsplashImage) {
    setApplying(image.id);
    onWallpaperChange(image.urls.full);
    saveWallpaperToDb(image.urls.full);
    setTimeout(() => setApplying(null), 600);
  }

  // Resetar para wallpaper padrão
  function resetWallpaper() {
    onWallpaperChange("/lofi-room-cover.png");
    saveWallpaperToDb("/lofi-room-cover.png");
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
        className="wallpaper-enter fixed z-50 flex flex-col overflow-hidden"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(92vw, 820px)",
          height: "min(88vh, 620px)",
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
          <h2 className="text-white font-semibold text-base tracking-wide">Imagem de fundo</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-5 pt-4 pb-2 flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar wallpapers..."
              className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none px-3 py-2.5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            />
            <button
              onClick={handleSearch}
              className="flex items-center justify-center w-11 h-11 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
              style={{ border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <Search size={17} />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="px-5 py-2 flex-shrink-0 flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.query}
              onClick={() => handleCategoryClick(cat.query)}
              className="px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
              style={{
                background: activeCategory === cat.query ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${activeCategory === cat.query ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"}`,
                color: activeCategory === cat.query ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
              }}
            >
              {cat.label}
            </button>
          ))}
          <button
            onClick={resetWallpaper}
            className="px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
            style={{
              background: currentWallpaper === "/lofi-room-cover.png" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${currentWallpaper === "/lofi-room-cover.png" ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"}`,
              color: currentWallpaper === "/lofi-room-cover.png" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
            }}
          >
            Padr&atilde;o
          </button>
        </div>

        {/* Gallery */}
        <div
          ref={scrollRef}
          className="wallpaper-scroll flex-1 overflow-y-auto px-5 py-3"
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={22} className="text-white/30 animate-spin" />
            </div>
          ) : images.length === 0 ? (
            <p className="text-white/25 text-sm text-center py-16">Nenhum resultado encontrado</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => selectWallpaper(image)}
                    className="group relative rounded-xl overflow-hidden cursor-pointer aspect-video"
                    style={{
                      border: currentWallpaper === image.urls.full
                        ? "2px solid rgba(255,255,255,0.6)"
                        : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.urls.small}
                      alt={image.alt_description || "Wallpaper"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Overlay on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2"
                      style={{ background: "linear-gradient(transparent 40%, rgba(0,0,0,0.7))" }}
                    >
                      <span className="text-white/70 text-[10px] truncate">
                        por{" "}
                        <a
                          href={`${image.user.links.html}?utm_source=lofi_room&utm_medium=referral`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {image.user.name}
                        </a>
                      </span>
                    </div>

                    {/* Selected check */}
                    {currentWallpaper === image.urls.full && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Check size={14} className="text-white" />
                      </div>
                    )}

                    {/* Applying indicator */}
                    {applying === image.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Loader2 size={20} className="text-white animate-spin" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-5 py-2 rounded-xl text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40"
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    {loadingMore ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Carregar mais"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer - Unsplash attribution */}
        <div
          className="px-5 py-2.5 flex-shrink-0 text-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span className="text-white/20 text-[10px]">
            Fotos por{" "}
            <a
              href="https://unsplash.com/?utm_source=lofi_room&utm_medium=referral"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/40"
            >
              Unsplash
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
