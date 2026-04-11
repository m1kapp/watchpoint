"use client";

import type { Player } from "@/lib/types";
import { TAG_COLORS } from "@/lib/data";
import { TEAM_LOGOS } from "@/lib/matches";
import { positionColor } from "@/lib/utils";

interface PlayerDetailProps {
  player: Player;
  onClose: () => void;
}

const POSITION_FULL: Record<string, string> = {
  PG: "포인트가드",
  SG: "슈팅가드",
  SF: "스몰포워드",
  PF: "파워포워드",
  C: "센터",
};

export function PlayerDetail({ player, onClose }: PlayerDetailProps) {
  const { name, position, height, number, team, bio, tags } = player;
  const { birth_year, age, career_year, national_team } = bio;
  const teamLogo = TEAM_LOGOS[team];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      {/* 딤 배경 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* 바텀 시트 */}
      <div
        className="relative w-full max-w-sm bg-white rounded-t-3xl px-5 pt-5 pb-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 드래그 핸들 */}
        <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mb-5" />

        {/* 헤더: 이름 + 포지션 */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white shrink-0"
            style={{ backgroundColor: positionColor(position) }}
          >
            <span className="text-xl font-black leading-none">{number}</span>
            <span className="text-[10px] font-bold opacity-80 mt-0.5">{position}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-zinc-900">{name}</h2>
            <p className="text-sm text-zinc-500">
              {POSITION_FULL[position]} · {height}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {teamLogo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={teamLogo} alt={team} className="w-3.5 h-3.5 object-contain" />
              )}
              <p className="text-xs text-zinc-400">{team}</p>
            </div>
          </div>
          {national_team.is_national && (
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="text-2xl">🇰🇷</span>
              <span className="text-[10px] font-bold text-emerald-600">
                {national_team.level === "A대표팀" ? "A대표팀" : "후보"}
              </span>
            </div>
          )}
        </div>

        <div className="w-full h-px bg-zinc-100 my-4" />

        {/* 기본 정보 */}
        <div className="mb-4">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">기본 정보</p>
          <div className="grid grid-cols-2 gap-2">
            <InfoCell label="생년" value={`${birth_year}년생`} />
            <InfoCell label="나이" value={`만 ${age}세`} />
            <InfoCell label="연차" value={`${career_year}년차`} />
            <InfoCell label="포지션" value={POSITION_FULL[position]} />
          </div>
        </div>

        {/* 국가대표 */}
        {national_team.is_national && (
          <>
            <div className="w-full h-px bg-zinc-100 my-4" />
            <div className="mb-4">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">🇰🇷 국가대표</p>
              <div className="bg-emerald-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-emerald-800">{national_team.level}</p>
                  {national_team.years && (
                    <p className="text-xs text-emerald-600 mt-0.5">{national_team.years}</p>
                  )}
                </div>
                <span className="text-2xl">🏅</span>
              </div>
            </div>
          </>
        )}

        {/* 태그 전체 */}
        {tags.length > 0 && (
          <>
            <div className="w-full h-px bg-zinc-100 my-4" />
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">특성 태그</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full ${TAG_COLORS[tag] ?? "bg-zinc-100 text-zinc-600"}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-2xl bg-zinc-100 text-zinc-500 text-sm font-semibold active:bg-zinc-200 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-50 rounded-xl px-3 py-2.5">
      <p className="text-[10px] text-zinc-400 font-medium">{label}</p>
      <p className="text-sm font-bold text-zinc-800 mt-0.5">{value}</p>
    </div>
  );
}
