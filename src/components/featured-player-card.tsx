"use client";

import Image from "next/image";
import type { MatchPlayer } from "@/lib/match-types";
import { TAG_COLORS, TEAM_COLORS, TEAM_LOGOS } from "@/lib/matches";

interface FeaturedPlayerCardProps {
  player: MatchPlayer;
  onClick?: () => void;
}

function DiffBadge({ value, unit }: { value: number; unit: string }) {
  if (value === 0) return null;
  const up = value > 0;
  return (
    <span className={`text-[10px] font-bold tabular-nums ${up ? "text-emerald-500" : "text-red-400"}`}>
      {up ? "↑" : "↓"}{Math.abs(value).toFixed(1)}{unit}
    </span>
  );
}

export function FeaturedPlayerCard({ player, onClick }: FeaturedPlayerCardProps) {
  const { name, position, height, imageUrl, bio, stat_summary, stats, stat_diff, career_highlights, tags, description, watch_point, team } = player;
  const teamColors = TEAM_COLORS[team] ?? { bg: "#333", text: "white", light: "#f4f4f5" };
  const teamLogo = TEAM_LOGOS[team];
  const isNational = bio?.national_team?.is_national;
  const visibleTags = tags.slice(0, 3);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 active:scale-[0.98] transition-transform"
    >
      <div className="p-4">
        {/* 상단: 아바타 + 이름 */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative shrink-0">
            {imageUrl ? (
              <div className="w-10 h-10 rounded-full overflow-hidden" style={{ boxShadow: `0 0 0 2px ${teamColors.bg}` }}>
                <Image src={imageUrl} alt={name} width={40} height={40} className="w-full h-full object-cover object-top" unoptimized />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-base"
                style={{ backgroundColor: teamColors.bg }}
              >
                {name[0]}
              </div>
            )}
            {/* 팀 로고 뱃지 */}
            {teamLogo && (
              <div
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border-[1.5px] border-white dark:border-zinc-900"
                style={{ backgroundColor: teamColors.light }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={teamLogo} alt={team} className="w-2.5 h-2.5 object-contain" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-black text-zinc-900 dark:text-white leading-none">{name}</p>
              {isNational && <span className="text-xs leading-none">🇰🇷</span>}
              <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded text-white shrink-0" style={{ backgroundColor: teamColors.bg }}>
                {position}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 tabular-nums">
              {height}{bio && ` · ${bio.age}세 · ${bio.career_year}년차`}
            </p>
          </div>
        </div>

        {/* 설명 */}
        {description && (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3 truncate">{description}</p>
        )}

        {/* 커리어 하이라이트 */}
        {career_highlights && career_highlights.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {career_highlights.map((h, i) => (
              <span key={i} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                h.type === "award"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              }`}>
                {h.type === "award" ? "🏆 " : "📊 "}{h.label}
              </span>
            ))}
          </div>
        )}

        {/* 스탯 요약 */}
        <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-lg px-3 py-2 mb-3 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 flex-1 min-w-0 truncate">{stat_summary}</p>
          {stats && stat_diff && (
            <div className="flex gap-2 shrink-0">
              <DiffBadge value={stat_diff.points} unit="득" />
              <DiffBadge value={stat_diff.rebounds} unit="리" />
              <DiffBadge value={stat_diff.assists} unit="어" />
            </div>
          )}
        </div>

        {/* 태그 + 관전 포인트 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {visibleTags.map((tag) => (
            <span key={tag} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TAG_COLORS[tag] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
              {tag}
            </span>
          ))}
          {watch_point && (
            <span className="ml-auto text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0 flex items-center gap-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
              {watch_point}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
