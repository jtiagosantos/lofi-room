"use client";

import { Maximize, Minimize, FolderKanban, NotebookPen, Thermometer, Clock, AlarmClockOff, Link, Scissors, Calculator as CalculatorIcon, Newspaper, UserCircle } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import KanbanBoard from "./components/KanbanBoard";
import NotesBlock from "./components/NotesBlock";
import WeatherBlock from "./components/WeatherBlock";
import ClockBlock from "./components/ClockBlock";
import QuickLinks from "./components/QuickLinks";
import MusicPlayer from "./components/MusicPlayer";
import CalculatorBlock from "./components/Calculator";
import UrlShortener from "./components/UrlShortener";
import TechFeed from "./components/TechFeed";
import LoginScreen from "./components/LoginScreen";
import UserProfile from "./components/UserProfile";
import LoadingScreen from "./components/LoadingScreen";

type Note = {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
};

export default function Home() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [animationDone, setAnimationDone] = useState(false);
  const [prefetchedNotes, setPrefetchedNotes] = useState<Note[] | null>(null);
  const notesFetchedRef = useRef(false);

  const sessionReady = status !== "loading";
  const isLoggedIn = !!session?.user;

  // Prefetch das notas durante o loading
  useEffect(() => {
    if (sessionReady && isLoggedIn && !notesFetchedRef.current) {
      notesFetchedRef.current = true;
      fetch("/api/notes")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setPrefetchedNotes(data))
        .catch(() => setPrefetchedNotes([]));
    }
  }, [sessionReady, isLoggedIn]);

  const handleLoadingFinish = useCallback(() => {
    setAnimationDone(true);
  }, []);

  useEffect(() => {
    if (animationDone && sessionReady) {
      setIsLoading(false);
    }
  }, [animationDone, sessionReady]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showKanbanTooltip, setShowKanbanTooltip] = useState(false);
  const [showNotesTooltip, setShowNotesTooltip] = useState(false);
  const [activePanel, setActivePanel] = useState<"clock" | "kanban" | "notes" | "weather" | "links" | "urlshort" | "calc" | "feed" | "profile" | null>(null);
  const [showUrlShortTooltip, setShowUrlShortTooltip] = useState(false);
  const [showCalcTooltip, setShowCalcTooltip] = useState(false);
  const [showFeedTooltip, setShowFeedTooltip] = useState(false);
  const [showClockTooltip, setShowClockTooltip] = useState(false);
  const [showWeatherTooltip, setShowWeatherTooltip] = useState(false);
  const [showLinksTooltip, setShowLinksTooltip] = useState(false);
  const [showProfileTooltip, setShowProfileTooltip] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  function openPanel(panel: typeof activePanel) {
    if (panel === "clock") {
      // clock toggle doesn't require auth
      setActivePanel(activePanel === "clock" ? null : "clock");
      return;
    }
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    setActivePanel(panel);
  }

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
      {/* Title - canto superior esquerdo */}
      <div className="fixed top-4 left-4 z-50">
        <h1 className="text-white" style={{ fontFamily: "var(--font-pacifico)", fontSize: "28px" }}>
          Lofi Room
        </h1>
      </div>

      {/* Sidebar - canto superior direito com espaçamento das bordas */}
      <aside className="fixed top-4 right-4 z-50">
        <div
          className="flex gap-1 rounded-2xl p-1.5"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Left column - URL Shortener at bottom */}
          <div className="flex flex-col items-center justify-end gap-1">
            <div className="relative">
              <button
                onClick={() => openPanel("urlshort")}
                onMouseEnter={() => setShowUrlShortTooltip(true)}
                onMouseLeave={() => setShowUrlShortTooltip(false)}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
              >
                <Scissors size={19} />
              </button>

              {showUrlShortTooltip && (
                <div
                  className="tooltip-animate absolute right-full top-1/2 mr-3 px-2.5 py-1.5 rounded-lg text-xs text-white whitespace-nowrap pointer-events-none"
                  style={{
                    background: "rgba(30, 30, 30, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  Encurtador de URL
                </div>
              )}
            </div>
          </div>

          {/* Right column - all other buttons */}
          <div className="flex flex-col items-center gap-1">

          {/* Fullscreen button */}
          <div className="relative">
            <button
              onClick={toggleFullscreen}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              data-tooltip-anchor="fullscreen"
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            >
              {isFullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
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

          {/* Clock button */}
          <div className="relative">
            <button
              onClick={() => openPanel("clock")}
              onMouseEnter={() => setShowClockTooltip(true)}
              onMouseLeave={() => setShowClockTooltip(false)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            >
              {activePanel === "clock" ? <AlarmClockOff size={19} /> : <Clock size={19} />}
            </button>

            {showClockTooltip && (
              <div
                className="tooltip-animate absolute right-full top-1/2 mr-3 px-2.5 py-1.5 rounded-lg text-xs text-white whitespace-nowrap pointer-events-none"
                style={{
                  background: "rgba(30, 30, 30, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                }}
              >
                Relógio
              </div>
            )}
          </div>

          {/* Tech Feed button */}
          <div className="relative">
            <button
              onClick={() => openPanel("feed")}
              onMouseEnter={() => setShowFeedTooltip(true)}
              onMouseLeave={() => setShowFeedTooltip(false)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            >
              <Newspaper size={19} />
            </button>

            {showFeedTooltip && (
              <div
                className="tooltip-animate absolute right-full top-1/2 mr-3 px-2.5 py-1.5 rounded-lg text-xs text-white whitespace-nowrap pointer-events-none"
                style={{
                  background: "rgba(30, 30, 30, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                }}
              >
                Tech Feed
              </div>
            )}
          </div>

          {/* Kanban button */}
          <div className="relative">
            <button
              onClick={() => openPanel("kanban")}
              onMouseEnter={() => setShowKanbanTooltip(true)}
              onMouseLeave={() => setShowKanbanTooltip(false)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            >
              <FolderKanban size={19} />
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
              onClick={() => openPanel("notes")}
              onMouseEnter={() => setShowNotesTooltip(true)}
              onMouseLeave={() => setShowNotesTooltip(false)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            >
              <NotebookPen size={19} />
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
              onClick={() => openPanel("weather")}
              onMouseEnter={() => setShowWeatherTooltip(true)}
              onMouseLeave={() => setShowWeatherTooltip(false)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            >
              <Thermometer size={19} />
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

          {/* Links button */}
          <div className="relative">
            <button
              onClick={() => openPanel("links")}
              onMouseEnter={() => setShowLinksTooltip(true)}
              onMouseLeave={() => setShowLinksTooltip(false)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            >
              <Link size={19} />
            </button>

            {showLinksTooltip && (
              <div
                className="tooltip-animate absolute right-full top-1/2 mr-3 px-2.5 py-1.5 rounded-lg text-xs text-white whitespace-nowrap pointer-events-none"
                style={{
                  background: "rgba(30, 30, 30, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                }}
              >
                Links rápidos
              </div>
            )}
          </div>

          {/* Calculator button */}
          <div className="relative">
            <button
              onClick={() => openPanel("calc")}
              onMouseEnter={() => setShowCalcTooltip(true)}
              onMouseLeave={() => setShowCalcTooltip(false)}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            >
              <CalculatorIcon size={19} />
            </button>

            {showCalcTooltip && (
              <div
                className="tooltip-animate absolute right-full top-1/2 mr-3 px-2.5 py-1.5 rounded-lg text-xs text-white whitespace-nowrap pointer-events-none"
                style={{
                  background: "rgba(30, 30, 30, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                }}
              >
                Calculadora
              </div>
            )}
          {/* User profile button */}
          {isLoggedIn && (
            <div className="relative">
              <button
                onClick={() => openPanel("profile")}
                onMouseEnter={() => setShowProfileTooltip(true)}
                onMouseLeave={() => setShowProfileTooltip(false)}
                className="flex items-center justify-center w-9 h-9 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200 cursor-pointer overflow-hidden"
              >
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-6 h-6 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserCircle size={19} />
                )}
              </button>

              {showProfileTooltip && (
                <div
                  className="tooltip-animate absolute right-full top-1/2 mr-3 px-2.5 py-1.5 rounded-lg text-xs text-white whitespace-nowrap pointer-events-none"
                  style={{
                    background: "rgba(30, 30, 30, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  Perfil
                </div>
              )}
            </div>
          )}
          </div>
          </div>
        </div>
      </aside>

      {activePanel === "clock" && <ClockBlock />}
      {activePanel === "kanban" && <KanbanBoard onClose={() => setActivePanel(null)} />}
      {activePanel === "notes" && <NotesBlock onClose={() => setActivePanel(null)} initialNotes={prefetchedNotes} onNotesChange={setPrefetchedNotes} />}
      {activePanel === "weather" && <WeatherBlock onClose={() => setActivePanel(null)} />}
      {activePanel === "links" && <QuickLinks onClose={() => setActivePanel(null)} />}
      {activePanel === "urlshort" && <UrlShortener onClose={() => setActivePanel(null)} />}
      {activePanel === "calc" && <CalculatorBlock onClose={() => setActivePanel(null)} />}
      {activePanel === "feed" && <TechFeed onClose={() => setActivePanel(null)} />}
      {activePanel === "profile" && <UserProfile onClose={() => setActivePanel(null)} />}
      {showLogin && <LoginScreen onClose={() => setShowLogin(false)} />}
      <MusicPlayer />
      {isLoading && <LoadingScreen onFinish={handleLoadingFinish} />}
    </div>
  );
}
