"use client";

import { X, Delete } from "lucide-react";
import { useState, useEffect } from "react";

type Props = {
  onClose: () => void;
};

export default function Calculator({ onClose }: Props) {
  const [display, setDisplay] = useState("0");
  const [previous, setPrevious] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key >= "0" && e.key <= "9") handleDigit(e.key);
      if (e.key === ".") handleDigit(".");
      if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") handleOperator(e.key);
      if (e.key === "Enter" || e.key === "=") handleEquals();
      if (e.key === "Backspace") handleBackspace();
      if (e.key === "Delete") handleClear();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  function handleDigit(digit: string) {
    if (digit === "." && display.includes(".")) return;
    if (resetNext) {
      setDisplay(digit === "." ? "0." : digit);
      setResetNext(false);
    } else {
      setDisplay(display === "0" && digit !== "." ? digit : display + digit);
    }
  }

  function handleOperator(op: string) {
    if (previous !== null && operator && !resetNext) {
      const result = calculate(parseFloat(previous), parseFloat(display), operator);
      setPrevious(String(result));
      setDisplay(String(result));
    } else {
      setPrevious(display);
    }
    setOperator(op);
    setResetNext(true);
  }

  function handleEquals() {
    if (previous === null || !operator) return;
    const result = calculate(parseFloat(previous), parseFloat(display), operator);
    setDisplay(String(result));
    setPrevious(null);
    setOperator(null);
    setResetNext(true);
  }

  function handleClear() {
    setDisplay("0");
    setPrevious(null);
    setOperator(null);
    setResetNext(false);
  }

  function handleBackspace() {
    if (resetNext) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
  }

  function handlePercent() {
    setDisplay(String(parseFloat(display) / 100));
    setResetNext(true);
  }

  function handleToggleSign() {
    if (display === "0") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
  }

  function calculate(a: number, b: number, op: string): number {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b === 0 ? 0 : a / b;
      default: return b;
    }
  }

  function formatDisplay(val: string): string {
    const num = parseFloat(val);
    if (isNaN(num)) return "0";
    if (val.endsWith(".")) return val;
    if (val.includes(".") && val.endsWith("0")) return val;
    if (Math.abs(num) >= 1e12) return num.toExponential(4);
    return val;
  }

  const operatorLabel: Record<string, string> = { "+": "+", "-": "-", "*": "\u00d7", "/": "\u00f7" };

  const buttons = [
    { label: "AC", action: handleClear, style: "func" },
    { label: "+/-", action: handleToggleSign, style: "func" },
    { label: "%", action: handlePercent, style: "func" },
    { label: "\u00f7", action: () => handleOperator("/"), style: "op", key: "/" },
    { label: "7", action: () => handleDigit("7"), style: "num" },
    { label: "8", action: () => handleDigit("8"), style: "num" },
    { label: "9", action: () => handleDigit("9"), style: "num" },
    { label: "\u00d7", action: () => handleOperator("*"), style: "op", key: "*" },
    { label: "4", action: () => handleDigit("4"), style: "num" },
    { label: "5", action: () => handleDigit("5"), style: "num" },
    { label: "6", action: () => handleDigit("6"), style: "num" },
    { label: "-", action: () => handleOperator("-"), style: "op", key: "-" },
    { label: "1", action: () => handleDigit("1"), style: "num" },
    { label: "2", action: () => handleDigit("2"), style: "num" },
    { label: "3", action: () => handleDigit("3"), style: "num" },
    { label: "+", action: () => handleOperator("+"), style: "op", key: "+" },
    { label: "0", action: () => handleDigit("0"), style: "num", wide: true },
    { label: ".", action: () => handleDigit("."), style: "num" },
    { label: "=", action: handleEquals, style: "op" },
  ];

  function btnClass(style: string, key?: string) {
    const active = key && operator === key && resetNext;
    const base = "flex items-center justify-center rounded-xl text-sm font-medium transition-colors cursor-pointer h-12";
    if (style === "func") return `${base} text-white/90 hover:bg-white/15`;
    if (style === "op") return `${base} ${active ? "bg-white/25 text-white" : "text-amber-300/90 hover:bg-white/15"}`;
    return `${base} text-white/80 hover:bg-white/15`;
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
        className="calc-enter fixed z-50 flex flex-col overflow-hidden"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(90vw, 320px)",
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
          <h2 className="text-white font-semibold text-base tracking-wide">Calculadora</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Display */}
        <div className="px-5 py-4 flex flex-col items-end gap-1">
          {previous !== null && operator && (
            <span className="text-white/30 text-xs">
              {formatDisplay(previous)} {operatorLabel[operator] || operator}
            </span>
          )}
          <div className="flex items-center gap-2 w-full">
            <span
              className="text-white font-light text-right flex-1 overflow-hidden"
              style={{ fontSize: display.length > 12 ? "24px" : display.length > 8 ? "30px" : "36px" }}
            >
              {formatDisplay(display)}
            </span>
            <button
              onClick={handleBackspace}
              className="text-white/30 hover:text-white/70 transition-colors cursor-pointer flex-shrink-0"
            >
              <Delete size={18} />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div
          className="grid grid-cols-4 gap-2 px-4 pb-4"
        >
          {buttons.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              className={btnClass(btn.style, btn.key)}
              style={{
                gridColumn: btn.wide ? "span 2" : undefined,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
