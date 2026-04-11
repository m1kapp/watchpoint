"use client";

import type { MatchData } from "@/lib/match-types";
import { TEAM_COLORS, TEAM_LOGOS } from "@/lib/matches";

interface MatchHeaderProps {
  data: MatchData;
}

export function MatchHeader({ data }: MatchHeaderProps) {
  const { match, teams } = data;
  const home = teams.find((t) => t.name === match.home)!;
  const away = teams.find((t) => t.name === match.away)!;

  const dateObj = new Date(match.date);
  const dateStr = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;

  return (
    <div className="px-4 pt-2 pb-4">
      {/* 스테이지 배지 */}
      <div className="flex justify-center mb-3">
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-zinc-900 text-white tracking-wide">
          {match.stage}
        </span>
      </div>

      {/* VS 카드 */}
      <div className="rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.1)]">
        <div className="flex">
          {/* 홈팀 */}
          <TeamSide team={home} side="home" />
          {/* 중앙 */}
          <div className="flex flex-col items-center justify-center px-3 py-4 bg-white gap-1 shrink-0">
            <span className="text-xs font-black text-zinc-300 tracking-widest">VS</span>
            <span className="text-[10px] text-zinc-400 font-medium">{dateStr}</span>
            <span className="text-[10px] text-zinc-400 font-medium">{match.time}</span>
          </div>
          {/* 어웨이팀 */}
          <TeamSide team={away} side="away" />
        </div>
        {/* 장소 */}
        <div className="bg-zinc-50 px-4 py-2 flex items-center justify-center gap-1.5">
          <span className="text-xs text-zinc-400">📍</span>
          <span className="text-xs text-zinc-500 font-medium">{match.location}</span>
        </div>
      </div>
    </div>
  );
}

function TeamSide({
  team,
  side,
}: {
  team: ReturnType<typeof Array.prototype.find> & { name: string; rank: number; summary: string };
  side: "home" | "away";
}) {
  const colors = TEAM_COLORS[team.name] ?? { bg: "#333", text: "white", light: "#f4f4f5" };
  const logo = TEAM_LOGOS[team.name];
  const isHome = side === "home";

  return (
    <div
      className={`flex-1 flex flex-col ${isHome ? "items-start" : "items-end"} px-4 py-4 gap-1`}
      style={{ backgroundColor: colors.light }}
    >
      {/* 순위 */}
      <span
        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
        style={{ backgroundColor: colors.bg }}
      >
        {team.rank}위
      </span>
      {/* 로고 */}
      {logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={team.name}
          className="w-12 h-12 object-contain"
        />
      )}
      {/* 팀명 */}
      <p className={`text-sm font-black text-zinc-900 leading-tight ${isHome ? "text-left" : "text-right"}`}>
        {team.name}
      </p>
      {/* 요약 */}
      <p className={`text-[10px] text-zinc-500 leading-tight ${isHome ? "text-left" : "text-right"}`}>
        {team.summary}
      </p>
    </div>
  );
}
