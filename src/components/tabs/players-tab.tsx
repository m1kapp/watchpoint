"use client";

import { useState } from "react";
import { Section } from "@m1kapp/ui";
import Image from "next/image";
import { MATCH, TAG_COLORS, TEAM_COLORS } from "@/lib/matches";
import { PlayerDetailSheet } from "@/components/player-detail-sheet";
import type { MatchPlayer } from "@/lib/match-types";

export function PlayersTab() {
  const [selected, setSelected] = useState<MatchPlayer | null>(null);
  const [teamFilter, setTeamFilter] = useState<"전체" | "하나은행" | "삼성생명">("전체");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const filtered = MATCH.players.filter((p) => {
    if (teamFilter !== "전체" && p.team !== teamFilter) return false;
    if (showFeaturedOnly && !p.featured) return false;
    return true;
  });

  return (
    <>
      <Section>
        {/* 팀 필터 */}
        <div className="flex gap-2 mb-2">
          {(["전체", "하나은행", "삼성생명"] as const).map((t) => {
            const colors = t !== "전체" ? TEAM_COLORS[t] : null;
            const active = teamFilter === t;
            return (
              <button
                key={t}
                onClick={() => setTeamFilter(t)}
                className="text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors"
                style={
                  active && colors
                    ? { backgroundColor: colors.bg, color: colors.text }
                    : active
                    ? { backgroundColor: "#18181b", color: "white" }
                    : { backgroundColor: "#f4f4f5", color: "#71717a" }
                }
              >
                {t}
              </button>
            );
          })}
          <button
            onClick={() => setShowFeaturedOnly((v) => !v)}
            className={`ml-auto text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors ${
              showFeaturedOnly
                ? "bg-amber-100 text-amber-700"
                : "bg-zinc-100 text-zinc-500"
            }`}
          >
            ⭐ 주목만
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map((player) => (
            <RosterRow
              key={`${player.team}-${player.name}`}
              player={player}
              onClick={() => setSelected(player)}
            />
          ))}
        </div>
      </Section>

      {selected && (
        <PlayerDetailSheet player={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function RosterRow({
  player,
  onClick,
}: {
  player: MatchPlayer;
  onClick: () => void;
}) {
  const { name, position, height, imageUrl, bio, stat_summary, tags, featured, team } = player;
  const colors = TEAM_COLORS[team] ?? { bg: "#333", text: "white", light: "#f4f4f5" };
  const isNational = bio?.national_team?.is_national;
  const visibleTags = tags.slice(0, 2);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl px-3 py-3 flex items-center gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-transform"
    >
      {/* 이미지 / 이니셜 */}
      {imageUrl ? (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
          <Image
            src={imageUrl}
            alt={name}
            width={40}
            height={40}
            className="w-full h-full object-cover object-top"
            unoptimized
          />
        </div>
      ) : (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-black shrink-0"
          style={{ backgroundColor: colors.bg }}
        >
          {name[0]}
        </div>
      )}

      {/* 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-sm font-bold text-zinc-900 truncate">{name}</p>
          {featured && <span className="text-[10px] text-amber-500 shrink-0">⭐</span>}
          {isNational && <span className="text-xs shrink-0">🇰🇷</span>}
        </div>
        <p className="text-[10px] text-zinc-400 mt-0.5">
          {position} · {height}{bio ? ` · ${bio.age}세` : ""}
        </p>
      </div>

      {/* 태그 + 스탯 */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <p className="text-[10px] text-zinc-500 font-medium">{stat_summary}</p>
        <div className="flex gap-1">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${TAG_COLORS[tag] ?? "bg-zinc-100 text-zinc-600"}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
