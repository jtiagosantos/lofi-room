"use client";

import { signIn } from "next-auth/react";
import { X } from "lucide-react";

type Props = {
  onClose: () => void;
};

export default function LoginScreen({ onClose }: Props) {
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
        className="login-enter fixed z-50 flex flex-col items-center overflow-hidden"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(90vw, 380px)",
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "20px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Close button */}
        <div className="w-full flex justify-end px-4 pt-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center gap-5 px-8 pb-8 pt-2">
          <h2
            className="text-white text-2xl"
            style={{ fontFamily: "var(--font-pacifico)" }}
          >
            Lofi Room
          </h2>

          <p className="text-white/40 text-xs text-center leading-relaxed">
            Faça login para acessar todas as features da plataforma
          </p>

          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-colors cursor-pointer hover:bg-white/15"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-white/80 text-sm">Entrar com Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
