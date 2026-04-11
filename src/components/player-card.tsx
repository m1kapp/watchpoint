"use client";

import Image from "next/image";
import type { Player } from "@/lib/types";
import { TAG_COLORS } from "@/lib/data";
import { TEAM_LOGOS } from "@/lib/matches";
import { positionColor } from "@/lib/utils";

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
}

export function PlayerCard({ player, onClick }: PlayerCardProps) {
  const { name, position, height, number, team, imageUrl, bio, tags } = player;
  const { age, career_year, national_team } = bio;
  const visibleTags = tags.slice(0, 3);
  const posColor = positionColor(position);
  const teamLogo = TEAM_LOGOS[team];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* 아바타 */}
        <div className="relative shrink-0">
          {imageUrl ? (
            <div className="w-10 h-10 rounded-full overflow-hidden" style={{ boxShadow: `0 0 0 2px ${posColor}` }}>
              <Image src={imageUrl} alt={name} width={40} height={40} className="w-full h-full object-cover object-top" unoptimized />
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-full flex flex-col items-center justify-center text-white shrink-0"
              style={{ backgroundColor: posColor }}
            >
              <span className="text-sm font-black leading-none tabular-nums">{number}</span>
              <span className="text-[9px] font-bold opacity-75">{position}</span>
            </div>
          )}
          {/* 팀 로고 뱃지 (이미지 없을 땐 번호 대신) */}
          {teamLogo ? (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border-[1.5px] border-white dark:border-zinc-900 bg-white dark:bg-zinc-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={teamLogo} alt={team} className="w-2.5 h-2.5 object-contain" />
            </div>
          ) : imageUrl ? (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-black border-[1.5px] border-white dark:border-zinc-900"
              style={{ backgroundColor: posColor }}
            >
              {number}
            </div>
          ) : null}
        </div>

        {/* 텍스트 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-black text-zinc-900 dark:text-white leading-none">{name}</p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 tabular-nums">
                {position} · {height} · 만 {age}세 · {career_year}년차
              </p>
            </div>
            {national_team.is_national && (
              <div className="flex flex-col items-center gap-0.5 shrink-0">
                <span className="text-sm leading-none">🇰🇷</span>
                <span className="text-[9px] font-bold text-emerald-500 dark:text-emerald-400 leading-none whitespace-nowrap">
                  {national_team.level === "A대표팀" ? "A대표" : "후보"}
                </span>
              </div>
            )}
          </div>

          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {visibleTags.map((tag) => (
                <span key={tag} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${TAG_COLORS[tag] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-[10px] text-zinc-400 dark:text-zinc-600 py-0.5">+{tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
