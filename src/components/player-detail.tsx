"use client";

import { useState } from "react";
import Image from "next/image";
import type { Player } from "@/lib/types";
import type {
  MatchPlayer,
  StatLine,
  StatDiff,
  CareerSeason,
  CareerHighlight,
  DraftInfo,
} from "@/lib/match-types";
import { TAG_COLORS, findPlayer, TEAMS } from "@/lib/data";
import { getTeamColor, getTeamLogo } from "@/lib/team-styles";
import { positionColor } from "@/lib/utils";
import { SourceRow } from "@/components/source-chip";
import { Tooltip } from "@m1kapp/ui";

// ─── Normalized type ───────────────────────────────────────────────────────────

interface NormalizedPlayer {
  name: string;
  position: string;
  height: string;
  number?: number;
  team: string;
  imageUrl?: string | null;
  description?: string;
  watch_point?: string;
  tags: string[];
  bio?: {
    age?: number;
    career_year?: number;
    birth_year?: number;
    national_team?: { is_national: boolean; level?: string; years?: string };
  };
  // Season comparison (from MatchPlayer)
  stats?: { current_season: StatLine; previous_season: StatLine };
  stat_diff?: StatDiff;
  // Career — career_seasons[0]이 현재 시즌 (상세 스탯 포함)
  career_seasons?: CareerSeason[];
  career_highlights?: CareerHighlight[];
  draft?: DraftInfo;
}

type TeamColor = { bg: string; text: string; light: string };

// ─── Adapters ──────────────────────────────────────────────────────────────────

function fromPlayer(p: Player): NormalizedPlayer {
  return {
    name: p.name,
    position: p.position,
    height: p.height,
    number: p.number,
    team: p.team,
    imageUrl: p.imageUrl,
    tags: p.tags,
    bio: {
      age: p.bio.age,
      career_year: p.bio.career_year,
      birth_year: p.bio.birth_year,
      national_team: {
        is_national: p.bio.national_team.is_national,
        level: p.bio.national_team.level !== "없음" ? p.bio.national_team.level : undefined,
        years: p.bio.national_team.years,
      },
    },
    draft: p.draft,
    career_seasons: p.career_seasons,
    career_highlights: p.career_highlights,
  };
}

function fromMatchPlayer(p: MatchPlayer): NormalizedPlayer {
  // ID 우선 → name+team 폴백으로 로스터 매칭
  const roster = findPlayer(p.id, p.name, p.team);

  const bio: NormalizedPlayer["bio"] = p.bio
    ? {
        age: p.bio.age,
        career_year: p.bio.career_year,
        birth_year: p.bio.birth_year,
        national_team: p.bio.national_team
          ? { is_national: p.bio.national_team.is_national ?? false, level: p.bio.national_team.level }
          : undefined,
      }
    : roster
    ? {
        age: roster.bio.age,
        career_year: roster.bio.career_year,
        birth_year: roster.bio.birth_year,
        national_team: {
          is_national: roster.bio.national_team.is_national,
          level: roster.bio.national_team.level !== "없음" ? roster.bio.national_team.level : undefined,
          years: roster.bio.national_team.years,
        },
      }
    : undefined;

  return {
    name: p.name,
    position: p.position,
    height: p.height,
    number: roster?.number,
    team: p.team,
    imageUrl: p.imageUrl ?? roster?.imageUrl,
    description: p.description,
    watch_point: p.watch_point,
    tags: p.tags,
    bio,
    stats: p.stats,
    stat_diff: p.stat_diff,
    career_seasons: roster?.career_seasons,
    career_highlights: p.career_highlights ?? roster?.career_highlights,
    draft: roster?.draft,
  };
}

// ─── Tag guide ────────────────────────────────────────────────────────────────

const TAG_DESC: Record<string, { title: string; desc: string; basis: string }> = {
  MVP:           { title: "MVP",          desc: "리그 최우수선수상(MVP) 수상 경력자.",                                  basis: "수상 기록 기반" },
  신인왕:        { title: "신인왕",       desc: "신인왕상 수상 경력자.",                                              basis: "수상 기록 기반" },
  국가대표:      { title: "국가대표",     desc: "대한민국 여자농구 국가대표팀에 선발된 경력이 있는 선수.",              basis: "공식 출전 기록 기반 (수동)" },
  에이스:        { title: "에이스",       desc: "팀 내 최다 득점 선수 또는 PPG 15점 이상의 압도적 공격 핵심.",          basis: "팀내 득점 1위 또는 PPG 15+" },
  "1옵션":       { title: "1옵션",        desc: "에이스에 버금가는 팀의 주 득점원. 상대 수비의 주요 타깃.",             basis: "팀내 득점 2~3위 또는 PPG 9+" },
  폭발력:        { title: "폭발력",       desc: "경기당 10점 이상을 기록하는 고득점 선수.",                             basis: "PPG 10+" },
  플레이메이커:  { title: "플레이메이커", desc: "어시스트 능력이 뛰어난 팀 공격의 설계자.",                            basis: "APG 3.5+" },
  슈터:          { title: "슈터",         desc: "3점슛 성공률 35% 이상의 정확한 원거리 사격수.",                       basis: "3P% 35+ & 10경기 이상" },
  리바운더:      { title: "리바운더",     desc: "경기당 6.5개 이상의 리바운드를 잡아내는 보드 장악자.",                 basis: "RPG 6.5+" },
  "골밑 핵심":   { title: "골밑 핵심",   desc: "골밑에서 리바운드와 득점으로 팀의 내선을 지배하는 빅맨.",              basis: "RPG 7.5+ 또는 C·PF & RPG 4.5+" },
  수비형:        { title: "수비형",       desc: "경기당 1.2개 이상의 스틸을 기록하는 적극적인 수비 전문가.",            basis: "SPG 1.2+ & 15경기 이상" },
  베테랑:        { title: "베테랑",       desc: "10년 이상의 프로 경력을 보유한 노장 선수.",                           basis: "프로 경력 10년 이상" },
  안정감:        { title: "안정감",       desc: "풀시즌을 꾸준히 소화하며 팀에 안정적인 기여를 하는 선수.",             basis: "27경기+ & PPG 3+" },
  "흐름 체인저": { title: "흐름 체인저", desc: "벤치에서 출전해 흐름을 바꾸는 임팩트 있는 선수.",                     basis: "10~24경기 & PPG 4+ & 팀내 4위 이하" },
  식스맨:        { title: "식스맨",       desc: "주로 벤치에서 출발하지만 팀에 즉각적인 에너지와 득점을 공급하는 선수.", basis: "PPG 5+ & 22경기 미만 출장" },
};

function TagGuidePopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-t-3xl shadow-2xl overflow-y-auto max-h-[85dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-zinc-950 pt-4 pb-3 px-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="w-10 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">특성 태그 가이드</p>
              <p className="text-base font-black text-zinc-900 dark:text-white mt-0.5">태그 부여 기준</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        <div className="px-4 py-3 pb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-2 pr-3 w-[30%]">태그</th>
                <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-2">설명 · 기준</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(TAG_DESC).map(([key, info], i) => (
                <tr key={key} className={i % 2 === 0 ? "bg-zinc-50/60 dark:bg-zinc-900/40" : ""}>
                  <td className="py-2.5 pr-3 align-top">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${TAG_COLORS[key] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                      {key}
                    </span>
                  </td>
                  <td className="py-2.5 align-top">
                    <p className="text-[12px] text-zinc-600 dark:text-zinc-300 leading-snug">{info.desc}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{info.basis}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

const POSITION_FULL: Record<string, string> = {
  PG: "포인트가드", SG: "슈팅가드", SF: "스몰포워드", PF: "파워포워드", C: "센터",
};

function fmt(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined) return "-";
  return n.toFixed(digits);
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl px-3 py-2.5">
      <p className="text-[10px] text-zinc-400 font-medium">{label}</p>
      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">{value}</p>
    </div>
  );
}

function StatCell({ label, value, title }: { label: string; value: string; title?: string }) {
  const labelEl = (
    <span className="text-[10px] text-zinc-400 underline decoration-dotted decoration-zinc-300 underline-offset-2 cursor-help">
      {label}
    </span>
  );
  return (
    <div className="flex flex-col items-center gap-0.5">
      {title ? <Tooltip label={title}>{labelEl}</Tooltip> : labelEl}
      <span className="text-base font-black text-zinc-900 dark:text-white tabular-nums">{value}</span>
    </div>
  );
}

function StatRow({ label, current, prev, diff }: {
  label: string; current: number; prev: number; diff: number;
}) {
  const up = diff > 0;
  const noChange = diff === 0;
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 w-10">{label}</span>
      <span className="text-sm font-black text-zinc-900 dark:text-white tabular-nums">{current}</span>
      <span className="text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">{prev}</span>
      <span className={`text-[11px] font-bold w-12 text-right tabular-nums ${noChange ? "text-zinc-300 dark:text-zinc-600" : up ? "text-emerald-500" : "text-red-500"}`}>
        {noChange ? "−" : `${up ? "↑" : "↓"}${Math.abs(diff).toFixed(1)}`}
      </span>
    </div>
  );
}

// ─── Tab content ──────────────────────────────────────────────────────────────

function StatsTab({ player, colors }: { player: NormalizedPlayer; colors: TeamColor }) {
  const { stats, stat_diff, career_seasons } = player;
  const current = career_seasons?.[0];  // 현재 시즌 (상세 스탯 포함)

  if (!current && !stats && !career_seasons?.length) {
    return <p className="text-sm text-zinc-400 text-center py-8">스탯 정보가 없습니다.</p>;
  }

  return (
    <div className="space-y-5">
      {/* 현재 시즌 상세 스탯 */}
      {current && current.games > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{current.season} 시즌</p>
            <span className="text-[10px] text-zinc-400">{current.games}경기</span>
          </div>
          <SourceRow sources={[
            TEAMS.find(t => t.shortName === player.team)?.league === "KBL"
              ? { label: "KBL 공식", url: "https://www.kbl.or.kr" }
              : { label: "WKBL 공식", url: "https://www.wkbl.or.kr" }
          ]} />
          <div className="grid grid-cols-3 gap-2 mt-2.5 mb-3">
            {(["득점", "리바운드", "어시스트"] as const).map((label, i) => {
              const vals = [current.points, current.rebounds, current.assists];
              const titles = [
                "PPG — Points Per Game (경기당 평균 득점)",
                "RPG — Rebounds Per Game (경기당 평균 리바운드)",
                "APG — Assists Per Game (경기당 평균 어시스트)",
              ];
              return (
                <div key={label} className="bg-zinc-50 dark:bg-zinc-900 rounded-xl py-3 flex flex-col items-center">
                  <Tooltip label={titles[i]}>
                    <span className="text-[10px] text-zinc-400 mb-0.5 underline decoration-dotted decoration-zinc-300 underline-offset-2 cursor-help">{label}</span>
                  </Tooltip>
                  <span className="text-xl font-black text-zinc-900 dark:text-white tabular-nums">{fmt(vals[i])}</span>
                </div>
              );
            })}
          </div>
          {(current.spg != null || current.bpg != null || current.fgPct != null || current.threePct != null) && (
            <div className="grid grid-cols-4 gap-x-2 gap-y-1 bg-zinc-50 dark:bg-zinc-900 rounded-xl px-4 py-3">
              <StatCell label="스틸" value={fmt(current.spg)} title="SPG — Steals Per Game (경기당 평균 스틸)" />
              <StatCell label="블록" value={fmt(current.bpg)} title="BPG — Blocks Per Game (경기당 평균 블록)" />
              <StatCell label="2P%" value={`${fmt(current.fgPct)}%`} title="FG% — Field Goal % (2점슛 성공률)" />
              <StatCell label="3P%" value={`${fmt(current.threePct)}%`} title="3P% — 3-Point % (3점슛 성공률)" />
            </div>
          )}
        </div>
      )}

      {/* Season comparison */}
      {stats && stat_diff && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">시즌 비교</p>
            <div className="flex gap-4 text-[10px] text-zinc-400 dark:text-zinc-600">
              <span>이번</span><span>지난</span><span className="w-12 text-right">변화</span>
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl px-4 py-3 flex flex-col gap-2.5 border border-zinc-100 dark:border-zinc-800">
            <StatRow label="득점" current={stats.current_season.points} prev={stats.previous_season.points} diff={stat_diff.points} />
            <StatRow label="리바" current={stats.current_season.rebounds} prev={stats.previous_season.rebounds} diff={stat_diff.rebounds} />
            <StatRow label="어시" current={stats.current_season.assists} prev={stats.previous_season.assists} diff={stat_diff.assists} />
          </div>
        </div>
      )}

      {/* Career seasons */}
      {career_seasons && career_seasons.length > 0 && (
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">시즌별 커리어</p>
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            <div className="flex items-center px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-400 w-16">시즌</span>
              <span className="text-[10px] font-bold text-zinc-400 w-6 text-center">G</span>
              <span className="text-[10px] font-bold text-zinc-400 flex-1 text-center">득점</span>
              <span className="text-[10px] font-bold text-zinc-400 flex-1 text-center">리바</span>
              <span className="text-[10px] font-bold text-zinc-400 flex-1 text-center">어시</span>
            </div>
            {career_seasons.map((s, i) => {
              const isCurrent = i === 0;
              return (
                <div key={s.season + i} className={`flex items-center px-3 py-2.5 ${i !== career_seasons!.length - 1 ? "border-b border-zinc-50 dark:border-zinc-800/50" : ""}`}>
                  <div className="w-16">
                    <p className={`text-[11px] font-bold tabular-nums ${!isCurrent ? "text-zinc-500 dark:text-zinc-400" : ""}`} style={isCurrent ? { color: colors.bg } : {}}>
                      {s.season}
                    </p>
                  </div>
                  <span className="text-[11px] text-zinc-400 w-6 text-center tabular-nums">{s.games}</span>
                  <span className={`text-[12px] font-black flex-1 text-center tabular-nums ${isCurrent ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"}`}>{s.points}</span>
                  <span className={`text-[12px] font-black flex-1 text-center tabular-nums ${isCurrent ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"}`}>{s.rebounds}</span>
                  <span className={`text-[12px] font-black flex-1 text-center tabular-nums ${isCurrent ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"}`}>{s.assists}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// career_highlights를 시즌별로 그룹핑: "16-17 BEST 5 센터" → { "16-17": [...] }
function groupHighlightsBySeason(highlights: CareerHighlight[]) {
  const map = new Map<string, CareerHighlight[]>();
  for (const h of highlights) {
    const m = h.label.match(/^(\d{2}-\d{2})\s+/);
    const key = m ? m[1] : "기타";
    const body = m ? h.label.slice(m[0].length) : h.label;
    const arr = map.get(key) ?? [];
    arr.push({ ...h, label: body });
    map.set(key, arr);
  }
  // 최신 시즌 먼저 (내림차순)
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

function InfoTab({ player, colors }: { player: NormalizedPlayer; colors: TeamColor }) {
  const { bio, draft, career_highlights } = player;
  const grouped = career_highlights?.length ? groupHighlightsBySeason(career_highlights) : [];

  return (
    <div className="space-y-5">
      {/* Basic info */}
      {bio && (
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">기본 정보</p>
          <div className="grid grid-cols-2 gap-2">
            {!!bio.birth_year && <InfoCell label="생년" value={`${bio.birth_year}년생`} />}
            {!!bio.age && <InfoCell label="나이" value={`만 ${bio.age}세`} />}
            {!!bio.career_year && <InfoCell label="연차" value={`${bio.career_year}년차`} />}
            <InfoCell label="포지션" value={POSITION_FULL[player.position] ?? player.position} />
          </div>
        </div>
      )}

      {/* National team */}
      {bio?.national_team?.is_national && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">🇰🇷 국가대표</p>
            <SourceRow sources={[{ label: "공식 출전 기록" }]} />
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">{bio.national_team.level ?? "국가대표"}</p>
              {bio.national_team.years && (
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">{bio.national_team.years}</p>
              )}
            </div>
            <span className="text-2xl">🏅</span>
          </div>
        </div>
      )}

      {/* Draft */}
      {draft && (
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">드래프트</p>
          <div className="flex gap-2">
            {[
              { label: "연도", value: `${draft.year}년` },
              { label: "라운드", value: `${draft.round}라운드` },
              { label: "순번", value: `${draft.pick}순위` },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ backgroundColor: colors.light }}>
                <p className="text-[10px] text-zinc-500 mb-0.5">{label}</p>
                <p className="text-sm font-black" style={{ color: colors.bg }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Career highlights — 시즌별 그룹 */}
      {grouped.length > 0 && (
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">수상 · 기록</p>
          <div className="space-y-3">
            {grouped.map(([season, items]) => (
              <div key={season}>
                <p className="text-[10px] font-bold text-zinc-400 mb-1.5 pl-0.5">{season}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((h, i) => (
                    <span
                      key={i}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        h.type === "award"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}
                    >
                      {h.type === "award" ? "🏆 " : "📊 "}{h.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TagsTab({ player, onTagGuide }: { player: NormalizedPlayer; onTagGuide: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">특성 태그</p>
        <SourceRow sources={[{ label: "자체 산정" }]} />
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {player.tags.map((tag) => (
          <button
            key={tag}
            onClick={onTagGuide}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-transform ${TAG_COLORS[tag] ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <a
          href={`https://namu.wiki/w/${encodeURIComponent(player.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-sm font-semibold flex items-center justify-center gap-1.5 active:bg-zinc-50 dark:active:bg-zinc-800 transition-colors"
        >
          나무위키
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${player.name} ${player.team} 하이라이트`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 rounded-2xl border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 text-sm font-semibold flex items-center justify-center gap-1.5 active:bg-red-50 dark:active:bg-red-950/30 transition-colors"
        >
          하이라이트
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}

// ─── Unified component ────────────────────────────────────────────────────────

type Tab = "정보" | "스탯" | "특성";

function UnifiedPlayerDetail({ player, onClose }: { player: NormalizedPlayer; onClose: () => void }) {
  const posColor = positionColor(player.position);
  const teamColors: TeamColor = getTeamColor(player.team);
  const teamLogo = getTeamLogo(player.team);
  const isNational = player.bio?.national_team?.is_national;

  const hasInfo = !!(player.bio || player.draft || player.career_highlights?.length);
  const hasStats = !!(
    player.career_seasons?.length ||
    (player.stats && player.stat_diff)
  );
  const hasTags = player.tags.length > 0;

  const availableTabs: Tab[] = [
    ...(hasInfo  ? (["정보"] as Tab[]) : []),
    ...(hasStats ? (["스탯"] as Tab[]) : []),
    ...(hasTags  ? (["특성"] as Tab[]) : []),
  ];

  const [tab, setTab] = useState<Tab>(availableTabs[0] ?? "스탯");
  const [showTagGuide, setShowTagGuide] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={showTagGuide ? undefined : onClose}
    >
      {showTagGuide && <TagGuidePopup onClose={() => setShowTagGuide(false)} />}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <div
        className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-t-3xl shadow-2xl overflow-y-auto h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Team color top bar */}
        <div className="h-1 w-full sticky top-0 z-10" style={{ backgroundColor: teamColors.bg }} />

        {/* Team logo watermark */}
        {teamLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={teamLogo}
            alt={player.team}
            aria-hidden
            className="absolute top-4 right-5 w-20 h-20 object-contain opacity-[0.06] pointer-events-none select-none"
          />
        )}

        {/* Header */}
        <div
          className="px-5 pt-4 pb-4"
          style={{ background: `linear-gradient(160deg, ${posColor}12 0%, transparent 60%)` }}
        >
          {/* Drag handle */}
          <div className="w-10 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-5" />

          <div className="flex gap-4 items-end">
            {/* Profile photo */}
            <div
              className="w-24 h-24 rounded-2xl overflow-hidden shrink-0"
              style={{ boxShadow: `0 4px 20px ${posColor}40` }}
            >
              {player.imageUrl ? (
                <Image
                  src={player.imageUrl}
                  alt={player.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover object-top"
                  unoptimized
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white font-black text-3xl"
                  style={{ backgroundColor: posColor }}
                >
                  {player.name[0]}
                </div>
              )}
            </div>

            {/* Name + info */}
            <div className="flex-1 min-w-0 pb-1">
              {/* Number + position badge */}
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-white text-[10px] font-black mb-1.5"
                style={{ backgroundColor: posColor }}
              >
                {player.number != null && (
                  <>
                    <span>No.{player.number}</span>
                    <span className="opacity-60">·</span>
                  </>
                )}
                <span>{player.position}</span>
              </div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                {player.name}
                {isNational && <span className="ml-1.5 text-xl">🇰🇷</span>}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {POSITION_FULL[player.position] ?? player.position} · {player.height}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                {teamLogo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={teamLogo} alt={player.team} className="w-3.5 h-3.5 object-contain" />
                )}
                <p className="text-xs text-zinc-400">{player.team}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {player.description && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
              {player.description}
            </p>
          )}

          {/* Watch point */}
          {player.watch_point && (
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3 mt-3"
              style={{ backgroundColor: `${teamColors.bg}18` }}
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                style={{ color: teamColors.bg }} className="shrink-0"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: teamColors.bg }}>관전 포인트</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">{player.watch_point}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tab bar */}
        {availableTabs.length > 1 && (
          <div className="flex border-b border-zinc-100 dark:border-zinc-800 sticky top-1 bg-white dark:bg-zinc-950 z-10 px-5">
            {availableTabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-bold transition-colors border-b-2 ${
                  tab === t ? "" : "border-transparent text-zinc-400 dark:text-zinc-500"
                }`}
                style={tab === t ? { borderColor: teamColors.bg, color: teamColors.bg } : {}}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Tab content */}
        <div className="px-5 pt-4 pb-8">
          {tab === "정보" && <InfoTab player={player} colors={teamColors} />}
          {tab === "스탯" && <StatsTab player={player} colors={teamColors} />}
          {tab === "특성" && <TagsTab player={player} onTagGuide={() => setShowTagGuide(true)} />}

          <button
            onClick={onClose}
            className="w-full mt-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm font-semibold active:bg-zinc-200 dark:active:bg-zinc-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Public exports ────────────────────────────────────────────────────────────

export function PlayerDetail({ player, onClose }: { player: Player; onClose: () => void }) {
  return <UnifiedPlayerDetail player={fromPlayer(player)} onClose={onClose} />;
}

export function PlayerDetailSheet({ player, onClose }: { player: MatchPlayer; onClose: () => void }) {
  return <UnifiedPlayerDetail player={fromMatchPlayer(player)} onClose={onClose} />;
}
