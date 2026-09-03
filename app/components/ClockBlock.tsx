"use client";

import { useState, useEffect } from "react";

export default function ClockBlock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const weekDays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

  const weekDay = weekDays[now.getDay()];
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  return (
    <>
      <style>{`
        @keyframes clock-text-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .clock-text-enter {
          animation: clock-text-in 0.2s ease-out forwards;
        }
      `}</style>

      <div className="clock-text-enter fixed inset-0 z-40 flex flex-col items-center justify-center gap-2 pointer-events-none">
        {/* Time */}
        <div className="flex items-end gap-2">
          <span
            className="text-white font-light"
            style={{ fontSize: "96px", lineHeight: 1, textShadow: "0 2px 24px rgba(0,0,0,0.6)" }}
          >
            {hours}:{minutes}
          </span>
          <span
            className="text-white/50 font-light pb-3"
            style={{ fontSize: "48px", lineHeight: 1, textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}
          >
            {seconds}
          </span>
        </div>

        {/* Date */}
        <span
          className="text-white/60 text-lg tracking-wide"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
        >
          {weekDay}, {day} de {month} de {year}
        </span>
      </div>
    </>
  );
}
