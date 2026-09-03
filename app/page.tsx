"use client";

import { Maximize, Minimize, FolderKanban, NotebookPen, Thermometer } from "lucide-react";
import { useEffect, useState } from "react";
import KanbanBoard from "./components/KanbanBoard";
import NotesBlock from "./components/NotesBlock";
import WeatherBlock from "./components/WeatherBlock";

export default function Home() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showKanbanTooltip, setShowKanbanTooltip] = useState(false);
  const [showNotesTooltip, setShowNotesTooltip] = useState(false);
  const [activePanel, setActivePanel] = useState<"kanban" | "notes" | "weather" | null>(null);
  const [showWeatherTooltip, setShowWeatherTooltip] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setShowTooltip(false);
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  useEffect(() => {
    if (!showTooltip) return;
    const handleMouseMove = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const button = el?.closest("button");
      if (!button || button.getAttribute("data-tooltip-anchor") !== "fullscreen") {
        setShowTooltip(false);
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [showTooltip]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black" style={{ backgroundImage: "url('/lofi-room-cover.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
      <style>{`
        @keyframes tooltip-in {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(8px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }
        .tooltip-animate {
          animation: tooltip-in 0.15s ease-out forwards;
        }
      `}</style>

      {/* Title - canto superior esquerdo */}
      <div className="fixed top-4 left-4 z-50">
        <h1 className="text-white" style={{ fontFamily: "var(--font-pacifico)", fontSize: "28px" }}>
          Lofi Room
        </h1>
      </div>

      {/* Sidebar - canto superior direito com espaçamento das bordas */}
      <aside className="fixed top-4 right-4 z-50">
        <div
          className="flex flex-col items-center gap-1 rounded-2xl p-1.5"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Fullscreen button */}
          <div className="relative">
            <button
              onClick={toggleFullscreen}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              data-tooltip-anchor="fullscreen"
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>

            {showTooltip && (
              <div
                className="tooltip-animate absolute right-full top-1/2 mr-3 px-2.5 py-1.5 rounded-lg text-xs text-white whitespace-nowrap pointer-events-none"
                style={{
                  background: "rgba(30, 30, 30, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                }}
              >
                {isFullscreen ? "Fechar modo tela cheia" : "Abrir modo tela cheia"}
              </div>
            )}
          </div>

          {/* Kanban button */}
          <div className="relative">
            <button
              onClick={() => setActivePanel("kanban")}
              onMouseEnter={() => setShowKanbanTooltip(true)}
              onMouseLeave={() => setShowKanbanTooltip(false)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            >
              <FolderKanban size={18} />
            </button>

            {showKanbanTooltip && (
              <div
                className="tooltip-animate absolute right-full top-1/2 mr-3 px-2.5 py-1.5 rounded-lg text-xs text-white whitespace-nowrap pointer-events-none"
                style={{
                  background: "rgba(30, 30, 30, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                }}
              >
                Board de tarefas
              </div>
            )}
          </div>

          {/* Notes button */}
          <div className="relative">
            <button
              onClick={() => setActivePanel("notes")}
              onMouseEnter={() => setShowNotesTooltip(true)}
              onMouseLeave={() => setShowNotesTooltip(false)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            >
              <NotebookPen size={18} />
            </button>

            {showNotesTooltip && (
              <div
                className="tooltip-animate absolute right-full top-1/2 mr-3 px-2.5 py-1.5 rounded-lg text-xs text-white whitespace-nowrap pointer-events-none"
                style={{
                  background: "rgba(30, 30, 30, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                }}
              >
                Bloco de anotações
              </div>
            )}
          </div>

          {/* Weather button */}
          <div className="relative">
            <button
              onClick={() => setActivePanel("weather")}
              onMouseEnter={() => setShowWeatherTooltip(true)}
              onMouseLeave={() => setShowWeatherTooltip(false)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            >
              <Thermometer size={18} />
            </button>

            {showWeatherTooltip && (
              <div
                className="tooltip-animate absolute right-full top-1/2 mr-3 px-2.5 py-1.5 rounded-lg text-xs text-white whitespace-nowrap pointer-events-none"
                style={{
                  background: "rgba(30, 30, 30, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                }}
              >
                Clima
              </div>
            )}
          </div>
        </div>
      </aside>

      {activePanel === "kanban" && <KanbanBoard onClose={() => setActivePanel(null)} />}
      {activePanel === "notes" && <NotesBlock onClose={() => setActivePanel(null)} />}
      {activePanel === "weather" && <WeatherBlock onClose={() => setActivePanel(null)} />}
    </div>
  );
}
