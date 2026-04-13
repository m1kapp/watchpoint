"use client";

import Image from "next/image";
import { TAG_COLORS, TAG_FALLBACK_CLASS, getTeamColor } from "@/lib/team-styles";

// ─── TagBadge ───────────────────────────────────────────────────

interface TagBadgeProps {
  tag: string;
  size?: "xs" | "sm";
}

export function TagBadge({ tag, size = "sm" }: TagBadgeProps) {
  const sizeClass = size === "xs"
    ? "text-[9px] px-1.5 py-0.5"
    : "text-[10px] px-2 py-0.5";
  return (
    <span className={`font-semibold rounded-full ${sizeClass} ${TAG_COLORS[tag] ?? TAG_FALLBACK_CLASS}`}>
      {tag}
    </span>
  );
}

// ─── TeamBadge ──────────────────────────────────────────────────

interface TeamBadgeProps {
  team: string;
  size?: "xs" | "sm";
}

export function TeamBadge({ team, size = "sm" }: TeamBadgeProps) {
  const colors = getTeamColor(team);
  const sizeClass = size === "xs"
    ? "text-[9px] px-1.5 py-0.5"
    : "text-[10px] px-2 py-0.5";
  return (
    <span
      className={`font-bold rounded-full text-white ${sizeClass}`}
      style={{ backgroundColor: colors.bg }}
    >
      {team}
    </span>
  );
}

// ─── AvatarCircle ───────────────────────────────────────────────

interface AvatarCircleProps {
  imageUrl?: string | null;
  name: string;
  bgColor: string;
  /** px 단위 (기본 40) */
  size?: number;
  /** 테두리 표시 */
  withBorder?: boolean;
  /** 모양 (기본 circle) */
  shape?: "circle" | "rounded";
}

export function AvatarCircle({
  imageUrl,
  name,
  bgColor,
  size = 40,
  withBorder = false,
  shape = "circle",
}: AvatarCircleProps) {
  const px = `${size / 4}rem`;
  const rounding = shape === "circle" ? "rounded-full" : "rounded-lg";
  const textSize = size <= 24 ? "text-[10px]" : size <= 32 ? "text-xs" : "text-base";

  if (imageUrl) {
    return (
      <div
        className={`${rounding} overflow-hidden shrink-0`}
        style={{
          width: px,
          height: px,
          boxShadow: withBorder ? `0 0 0 2px ${bgColor}` : undefined,
        }}
      >
        <Image
          src={imageUrl}
          alt={name}
          width={size}
          height={size}
          className="w-full h-full object-cover object-top"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`${rounding} flex items-center justify-center text-white font-black ${textSize} shrink-0`}
      style={{ width: px, height: px, backgroundColor: bgColor }}
    >
      {name[0]}
    </div>
  );
}

// ─── EyeIcon (관전포인트 아이콘) ────────────────────────────────

export function EyeIcon({ size = 10, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
