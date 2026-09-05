"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onFinish: () => void;
}

interface Dot {
  width: number;
  height: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
}

function generateDots(count: number): Dot[] {
  return Array.from({ length: count }, () => ({
    width: 2 + Math.random() * 3,
    height: 2 + Math.random() * 3,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 1.5 + Math.random() * 2,
  }));
}

export default function LoadingScreen({ onFinish }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    setDots(generateDots(20));
  }, []);

  useEffect(() => {
    const duration = 3000;
    const interval = 30;
    const step = 100 / (duration / interval);
    let current = 0;

    const timer = setInterval(() => {
      current += step + Math.random() * step * 0.5;
      if (current >= 100) {
        current = 100;
        clearInterval(timer);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onFinish, 500);
        }, 300);
      }
      setProgress(Math.min(current, 100));
    }, interval);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Pontos piscando no fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {dots.map((dot, i) => (
          <div
            key={i}
            className="loading-dot absolute rounded-full bg-white/20"
            style={{
              width: `${dot.width}px`,
              height: `${dot.height}px`,
              left: `${dot.left}%`,
              top: `${dot.top}%`,
              animationDelay: `${dot.delay}s`,
              animationDuration: `${dot.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Headphone */}
      <div className="relative mb-10">
        {/* Ondas sonoras saindo do headphone */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="sound-wave sound-wave-1" />
          <div className="sound-wave sound-wave-2" />
          <div className="sound-wave sound-wave-3" />
        </div>

        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg headphone-bob"
        >
          {/* Arco do headphone */}
          <path
            d="M25 68 Q25 20 60 16 Q95 20 95 68"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Detalhe interno do arco */}
          <path
            d="M30 66 Q30 26 60 22 Q90 26 90 66"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Almofada esquerda - haste */}
          <line x1="25" y1="64" x2="25" y2="76" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Almofada esquerda - corpo */}
          <rect x="14" y="70" width="22" height="34" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

          {/* Almofada esquerda - pad interno */}
          <rect x="18" y="75" width="14" height="24" rx="5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

          {/* Nota musical esquerda */}
          <g className="music-note music-note-1">
            <text x="8" y="62" fill="rgba(255,255,255,0.35)" fontSize="14" fontFamily="serif">&#9835;</text>
          </g>

          {/* Almofada direita - haste */}
          <line x1="95" y1="64" x2="95" y2="76" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Almofada direita - corpo */}
          <rect x="84" y="70" width="22" height="34" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

          {/* Almofada direita - pad interno */}
          <rect x="88" y="75" width="14" height="24" rx="5" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

          {/* Nota musical direita */}
          <g className="music-note music-note-2">
            <text x="108" y="66" fill="rgba(255,255,255,0.35)" fontSize="12" fontFamily="serif">&#9833;</text>
          </g>
        </svg>
      </div>

      {/* Texto */}
      <p
        className="text-white/60 text-base mb-6 tracking-wider"
        style={{ fontFamily: "var(--font-pacifico)" }}
      >
        Preparando seu ambiente...
      </p>

      {/* Barra de progresso */}
      <div className="w-64 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-white/40 transition-all duration-100 ease-out loading-bar-glow"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Porcentagem */}
      <p         className="text-white/30 text-sm mt-3 font-mono tabular-nums">
        {Math.round(progress)}%
      </p>
    </div>
  );
}
