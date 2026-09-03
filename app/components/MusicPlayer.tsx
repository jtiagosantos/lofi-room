"use client";

import { Play, Pause, Volume2, VolumeX, ListMusic, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

type Station = {
  id: string;
  title: string;
  channel: string;
};

const STATIONS: Station[] = [
  { id: "rFZHOHl-L8A", title: "Lofi Hip Hop Radio", channel: "Lofi Girl" },
  { id: "jfKfPfyJRdk", title: "Beats to Relax/Study To", channel: "Lofi Girl" },
  { id: "n61ULEU7CO0", title: "Best of Lofi Hip Hop 2021", channel: "Lofi Girl" },
  { id: "7NOSDKb0HlU", title: "Beats to Study/Relax To", channel: "Chillhop Music" },
  { id: "5yx6BWlEVcY", title: "Jazzy & Lofi Hip Hop Beats", channel: "Chillhop Music" },
  { id: "OFsJen4j9VY", title: "Purrple Cat Radio", channel: "Purrple Cat" },
  { id: "vrB9wC6quaU", title: "Rainy Lofi Vibes for a Calm Night", channel: "Lofi on the Rooftop" },
  { id: "4Q9jq-tdOoE", title: "Peaceful Lofi Coffee in 90's Tokyo", channel: "Lofi on the Rooftop" },
  { id: "kLZ4plrttPI", title: "Coffee Beach - Lofi Healing", channel: "Healing Me" },
  { id: "OOCeWZm5c8U", title: "Smooth Beats to Relax/Study [2018]", channel: "nourish." },
  { id: "WelpRyoV0UY", title: "Lofi Hip Hop Mix", channel: "Lofi Radio" },
  { id: "wA0C0uRxSaE", title: "Chill Lofi Beats", channel: "Lofi Radio" },
  { id: "q0BVR5jRXxE", title: "Lofi Chill Vibes", channel: "Lofi Radio" },
];

function buildSrc(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&rel=0`;
}

export default function MusicPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playlistRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(50);
  const [muted, setMuted] = useState(true);
  const [waitingUnmute, setWaitingUnmute] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const current = STATIONS[currentIndex];

  useEffect(() => {
    if (showPlaylist && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: "center" });
    }
  }, [showPlaylist]);

  const postCommand = useCallback((func: string, args?: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: args ? [args] : [] }),
      "*"
    );
  }, []);

  function activateSound() {
    postCommand("unMute");
    postCommand("setVolume", volume);
    setMuted(false);
    setWaitingUnmute(false);
  }

  function togglePlay() {
    if (playing) {
      postCommand("pauseVideo");
      setPlaying(false);
    } else {
      postCommand("playVideo");
      setPlaying(true);
    }
  }

  function toggleMute() {
    if (muted) {
      postCommand("unMute");
      postCommand("setVolume", volume);
      setMuted(false);
    } else {
      postCommand("mute");
      setMuted(true);
    }
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    setVolume(val);
    postCommand("setVolume", val);
    if (val > 0 && muted) {
      postCommand("unMute");
      setMuted(false);
    }
  }

  function selectStation(index: number) {
    setShowPlaylist(false);
    if (index === currentIndex) return;
    setCurrentIndex(index);
    setPlaying(true);
  }

  return (
    <div style={{ display: "contents" }}>
      {/* Hidden YouTube iframe */}
      <iframe
        ref={iframeRef}
        key={STATIONS[currentIndex].id + currentIndex}
        src={buildSrc(STATIONS[currentIndex].id)}
        allow="autoplay"
        style={{ position: "fixed", width: 1, height: 1, opacity: 0, pointerEvents: "none", bottom: 0, left: 0, border: "none" }}
        onLoad={() => {
          setTimeout(() => {
            if (waitingUnmute) {
              postCommand("mute");
            } else {
              postCommand("unMute");
              postCommand("setVolume", volume);
            }
            postCommand("playVideo");
          }, 500);
        }}
      />

      {/* Playlist panel */}
      {showPlaylist && (
        <div
          className="fixed bottom-20 right-4 z-50 rounded-2xl overflow-hidden"
          style={{
            width: 370,
            background: "rgba(15,15,15,0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <div ref={playlistRef} className="playlist-scroll overflow-y-auto" style={{ maxHeight: 280 }}>
            {STATIONS.map((station, i) => (
              <button
                key={station.id + i}
                ref={i === currentIndex ? activeItemRef : null}
                onClick={() => selectStation(i)}
                className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors cursor-pointer"
                style={{ background: i === currentIndex ? "rgba(255,255,255,0.08)" : "transparent" }}
                onMouseEnter={(e) => {
                  if (i !== currentIndex)
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (i !== currentIndex)
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <img
                  src={`https://i.ytimg.com/vi/${station.id}/mqdefault.jpg`}
                  alt={station.title}
                  className="flex-shrink-0 rounded-lg object-cover"
                  style={{ width: 56, height: 36 }}
                />
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className={`text-xs truncate ${i === currentIndex ? "text-white" : "text-white/70"}`}>
                    {station.title}
                  </span>
                  <span className="text-white/35 text-xs truncate">{station.channel}</span>
                </div>
                {i === currentIndex && (
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: playing ? "#4ade80" : "rgba(255,255,255,0.3)",
                      boxShadow: playing ? "0 0 6px #4ade80" : "none",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Player UI */}
      <div
        className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          width: 370,
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        }}
      >
        {waitingUnmute ? (
          /* Waiting for user interaction to unmute */
          <button
            onClick={activateSound}
            className="flex items-center gap-3 cursor-pointer w-full"
          >
            <Volume2 size={18} className="text-white/60 flex-shrink-0 animate-pulse" />
            <span className="text-white/70 text-xs">Clique para ativar o som</span>
          </button>
        ) : (
          /* Normal player controls */
          <>
            <button
              onClick={() => setShowPlaylist((v) => !v)}
              className="flex flex-col gap-0.5 text-left cursor-pointer group min-w-0 flex-1"
            >
              <span className="text-white/85 text-xs font-medium group-hover:text-white transition-colors flex items-center gap-1 w-full">
                <span className="truncate">{current.title}</span>
                <ChevronDown size={11} className="text-white/40 flex-shrink-0" />
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    background: playing ? "#4ade80" : "rgba(255,255,255,0.3)",
                    boxShadow: playing ? "0 0 6px #4ade80" : "none",
                  }}
                />
                <span className="text-white/40 text-xs">
                  {playing ? "Ao vivo" : "Pausado"}
                </span>
              </div>
            </button>

            <button
              onClick={togglePlay}
              className="flex items-center justify-center w-8 h-8 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                {muted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={muted ? 0 : volume}
                onChange={handleVolume}
                className="volume-slider"
              />
            </div>

            <button
              onClick={() => setShowPlaylist((v) => !v)}
              className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors cursor-pointer ${showPlaylist ? "text-white bg-white/10" : "text-white/40 hover:text-white hover:bg-white/10"}`}
            >
              <ListMusic size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
