"use client";

import { useState } from "react";
import { toast } from "sonner";

export interface DropdownOption {
  key: string;
  label: string;
  disabled?: boolean;
}

export function DropdownSelector({
  label,
  value,
  options,
  onSelect,
  accentColor,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  onSelect: (key: string) => void;
  accentColor?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-1 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 transition-all"
      >
        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 shrink-0">{label}</span>
        <span
          className="text-[12px] font-black text-zinc-900 dark:text-white truncate text-right"
          style={accentColor ? { color: accentColor } : undefined}
        >
          {value}
        </span>
        <svg
          width="10" height="10" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth={3}
          strokeLinecap="round" strokeLinejoin="round"
          className="shrink-0 text-zinc-400 dark:text-zinc-500"
          style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.15s" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 right-0 top-full mt-1 z-20 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
          >
            {options.map((o) => (
              <button
                key={o.key}
                onClick={() => {
                  if (!o.disabled) { onSelect(o.key); setOpen(false); }
                  else toast.info("준비중입니다");
                }}
                className="w-full text-left px-4 py-2.5 text-[12px] transition-colors"
                style={{
                  color: o.key === value
                    ? (accentColor ?? "#18181b")
                    : o.disabled ? "#d4d4d8" : "#52525b",
                  fontWeight: o.key === value ? 900 : 700,
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
