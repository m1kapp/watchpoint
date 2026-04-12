import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function positionColor(pos: string): string {
  const map: Record<string, string> = {
    PG: "#3b82f6",
    SG: "#8b5cf6",
    SF: "#10b981",
    PF: "#f59e0b",
    C: "#ef4444",
  };
  return map[pos] ?? "#6b7280";
}

export function positionLabel(pos: string): string {
  const map: Record<string, string> = {
    PG: "포인트가드",
    SG: "슈팅가드",
    SF: "스몰포워드",
    PF: "파워포워드",
    FC: "포워드센터",
    C:  "센터",
    F:  "포워드",
    G:  "가드",
  };
  return map[pos] ?? pos;
}
