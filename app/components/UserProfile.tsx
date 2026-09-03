"use client";

import { signOut, useSession } from "next-auth/react";
import { X, LogOut } from "lucide-react";

type Props = {
  onClose: () => void;
};

export default function UserProfile({ onClose }: Props) {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const { name, email, image } = session.user;

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
        className="profile-enter fixed z-50 flex flex-col overflow-hidden"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(90vw, 340px)",
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
          <h2 className="text-white font-semibold text-base tracking-wide">Perfil</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center gap-4 px-5 py-6">
          {image && (
            <img
              src={image}
              alt={name || ""}
              className="w-16 h-16 rounded-full"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="flex flex-col items-center gap-1">
            <span className="text-white font-medium text-sm">{name}</span>
            <span className="text-white/40 text-xs">{email}</span>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer text-sm justify-center mt-2"
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <LogOut size={16} />
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
