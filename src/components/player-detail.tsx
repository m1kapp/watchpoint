"use client";

import { useState } from "react";
import Image from "next/image";
import type { Player } from "@/lib/types";
import { TAG_COLORS } from "@/lib/data";
import { TEAM_LOGOS } from "@/lib/matches";
import { positionColor } from "@/lib/utils";
import { SourceRow } from "@/components/source-chip";
import { Tooltip } from "@m1kapp/ui";

// ─── 태그 설명 ────────────────────────────────────────────────────────────────

const TAG_DESC: Record<string, { title: string; desc: string; basis: string }> = {
  // 수상 / 명예
  MVP:           { title: "MVP",          desc: "리그 최우수선수상(MVP) 수상 경력자.",                                  basis: "수상 기록 기반" },
  신인왕:        { title: "신인왕",       desc: "신인왕상 수상 경력자.",                                              basis: "수상 기록 기반" },
  국가대표:      { title: "국가대표",     desc: "대한민국 여자농구 국가대표팀에 선발된 경력이 있는 선수.",              basis: "공식 출전 기록 기반 (수동)" },
  // 공격 핵심
  에이스:        { title: "에이스",       desc: "팀 내 최다 득점 선수 또는 PPG 15점 이상의 압도적 공격 핵심.",          basis: "팀내 득점 1위 또는 PPG 15+" },
  "1옵션":       { title: "1옵션",        desc: "에이스에 버금가는 팀의 주 득점원. 상대 수비의 주요 타깃.",             basis: "팀내 득점 2~3위 또는 PPG 9+" },
  폭발력:        { title: "폭발력",       desc: "경기당 10점 이상을 기록하는 고득점 선수.",                             basis: "PPG 10+" },
  // 스킬
  플레이메이커:  { title: "플레이메이커", desc: "어시스트 능력이 뛰어난 팀 공격의 설계자.",                            basis: "APG 3.5+" },
  슈터:          { title: "슈터",         desc: "3점슛 성공률 35% 이상의 정확한 원거리 사격수.",                       basis: "3P% 35+ & 10경기 이상" },
  리바운더:      { title: "리바운더",     desc: "경기당 6.5개 이상의 리바운드를 잡아내는 보드 장악자.",                 basis: "RPG 6.5+" },
  "골밑 핵심":   { title: "골밑 핵심",   desc: "골밑에서 리바운드와 득점으로 팀의 내선을 지배하는 빅맨.",              basis: "RPG 7.5+ 또는 C·PF & RPG 4.5+" },
  수비형:        { title: "수비형",       desc: "경기당 1.2개 이상의 스틸을 기록하는 적극적인 수비 전문가.",            basis: "SPG 1.2+ & 15경기 이상" },
  // 역할 / 경력
  베테랑:        { title: "베테랑",       desc: "10년 이상의 프로 경력을 보유한 노장 선수.",                           basis: "프로 경력 10년 이상" },
  안정감:        { title: "안정감",       desc: "풀시즌을 꾸준히 소화하며 팀에 안정적인 기여를 하는 선수.",             basis: "27경기+ & PPG 3+" },
  "흐름 체인저": { title: "흐름 체인저", desc: "벤치에서 출전해 흐름을 바꾸는 임팩트 있는 선수.",                     basis: "10~24경기 & PPG 4+ & 팀내 4위 이하" },
  식스맨:        { title: "식스맨",       desc: "주로 벤치에서 출발하지만 팀에 즉각적인 에너지와 득점을 공급하는 선수.", basis: "PPG 5+ & 22경기 미만 출장" },
};

const ALL_TAGS = Object.entries(TAG_DESC);

function TagGuidePopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-sm bg-white rounded-t-3xl shadow-2xl overflow-y-auto max-h-[85dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="sticky top-0 bg-white pt-4 pb-3 px-5 border-b border-zinc-100">
          <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">특성 태그 가이드</p>
              <p className="text-base font-black text-zinc-900 mt-0.5">태그 부여 기준</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* 태그 표 */}
        <div className="px-4 py-3 pb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-2 pr-3 w-[30%]">태그</th>
                <th className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-2">설명 · 기준</th>
              </tr>
            </thead>
            <tbody>
              {ALL_TAGS.map(([key, info], i) => (
                <tr key={key} className={i % 2 === 0 ? "bg-zinc-50/60" : ""}>
                  <td className="py-2.5 pr-3 align-top">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${TAG_COLORS[key] ?? "bg-zinc-100 text-zinc-600"}`}>
                      {key}
                    </span>
                  </td>
                  <td className="py-2.5 align-top">
                    <p className="text-[12px] text-zinc-600 leading-snug">{info.desc}</p>
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

function StatCell({ label, value, title }: { label: string; value: string; title?: string }) {
  const labelEl = (
    <span className="text-[10px] text-zinc-400 font-medium underline decoration-dotted decoration-zinc-300 underline-offset-2 cursor-help">
      {label}
    </span>
  );
  return (
    <div className="flex flex-col items-center gap-0.5">
      {title ? <Tooltip label={title}>{labelEl}</Tooltip> : labelEl}
      <span className="text-base font-black text-zinc-900 tabular-nums">{value}</span>
    </div>
  );
}

function fmt(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined) return "-";
  return n.toFixed(digits);
}

export function PlayerDetail({ player, onClose }: PlayerDetailProps) {
  const [showTagGuide, setShowTagGuide] = useState(false);
  const { name, position, height, number, team, bio, tags, imageUrl, seasonStats } = player;
  const { birth_year, age, career_year, national_team } = bio;
  const teamLogo = TEAM_LOGOS[team];
  const posColor = positionColor(position);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={showTagGuide ? undefined : onClose}>
      {showTagGuide && <TagGuidePopup onClose={() => setShowTagGuide(false)} />}
      {/* 딤 배경 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* 바텀 시트 */}
      <div
        className="relative w-full max-w-sm bg-white rounded-t-3xl shadow-2xl overflow-y-auto max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 히어로: 프로필 사진 + 이름 */}
        <div className="relative px-5 pt-5 pb-4" style={{ background: `linear-gradient(160deg, ${posColor}18 0%, white 70%)` }}>
          {/* 드래그 핸들 */}
          <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto mb-5" />

          <div className="flex gap-4 items-end">
            {/* 프로필 사진 */}
            <div
              className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-md"
              style={{ boxShadow: `0 4px 20px ${posColor}40` }}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={name}
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
                  {name[0]}
                </div>
              )}
            </div>

            {/* 이름 + 기본 정보 */}
            <div className="flex-1 min-w-0 pb-1">
              {/* 등번호 뱃지 */}
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-white text-[10px] font-black mb-1.5"
                style={{ backgroundColor: posColor }}
              >
                <span>No.{number}</span>
                <span className="opacity-70">·</span>
                <span>{position}</span>
              </div>
              <h2 className="text-2xl font-black text-zinc-900 leading-tight">{name}</h2>
              <p className="text-sm text-zinc-500 mt-0.5">{POSITION_FULL[position] ?? position} · {height}</p>
              <div className="flex items-center gap-1.5 mt-1">
                {teamLogo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={teamLogo} alt={team} className="w-3.5 h-3.5 object-contain" />
                )}
                <p className="text-xs text-zinc-400">{team}</p>
                {national_team.is_national && (
                  <span className="ml-1 text-sm">🇰🇷</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-8">
          {/* 시즌 스탯 */}
          {seasonStats && seasonStats.games != null && (
            <>
              <div className="w-full h-px bg-zinc-100 mb-4" />
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">2025-26 시즌 스탯</p>
                  <span className="text-[10px] text-zinc-400">{seasonStats.games}경기</span>
                </div>
                <SourceRow sources={[{ label: "WKBL 공식", url: "https://www.wkbl.or.kr" }]} />

                {/* 주요 스탯 3개 강조 */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-zinc-50 rounded-xl py-3 flex flex-col items-center">
                    <Tooltip label="PPG — Points Per Game (경기당 평균 득점)">
                      <span className="text-[10px] text-zinc-400 mb-0.5 underline decoration-dotted decoration-zinc-300 underline-offset-2 cursor-help">득점</span>
                    </Tooltip>
                    <span className="text-xl font-black text-zinc-900 tabular-nums">{fmt(seasonStats.ppg)}</span>
                  </div>
                  <div className="bg-zinc-50 rounded-xl py-3 flex flex-col items-center">
                    <Tooltip label="RPG — Rebounds Per Game (경기당 평균 리바운드)">
                      <span className="text-[10px] text-zinc-400 mb-0.5 underline decoration-dotted decoration-zinc-300 underline-offset-2 cursor-help">리바운드</span>
                    </Tooltip>
                    <span className="text-xl font-black text-zinc-900 tabular-nums">{fmt(seasonStats.rpg)}</span>
                  </div>
                  <div className="bg-zinc-50 rounded-xl py-3 flex flex-col items-center">
                    <Tooltip label="APG — Assists Per Game (경기당 평균 어시스트)">
                      <span className="text-[10px] text-zinc-400 mb-0.5 underline decoration-dotted decoration-zinc-300 underline-offset-2 cursor-help">어시스트</span>
                    </Tooltip>
                    <span className="text-xl font-black text-zinc-900 tabular-nums">{fmt(seasonStats.apg)}</span>
                  </div>
                </div>

                {/* 세부 스탯 */}
                <div className="grid grid-cols-4 gap-x-2 gap-y-1 bg-zinc-50 rounded-xl px-4 py-3">
                  <StatCell label="스틸" value={fmt(seasonStats.spg)} title="SPG — Steals Per Game (경기당 평균 스틸)" />
                  <StatCell label="블록" value={fmt(seasonStats.bpg)} title="BPG — Blocks Per Game (경기당 평균 블록)" />
                  <StatCell label="2P%" value={`${fmt(seasonStats.fgPct)}%`} title="FG% — Field Goal % (2점슛 성공률)" />
                  <StatCell label="3P%" value={`${fmt(seasonStats.threePct)}%`} title="3P% — 3-Point % (3점슛 성공률)" />
                </div>
              </div>
            </>
          )}

          {/* 기본 정보 */}
          <div className="w-full h-px bg-zinc-100 mb-4" />
          <div className="mb-4">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">기본 정보</p>
            <div className="grid grid-cols-2 gap-2">
              <InfoCell label="생년" value={`${birth_year}년생`} />
              <InfoCell label="나이" value={`만 ${age}세`} />
              <InfoCell label="연차" value={`${career_year}년차`} />
              <InfoCell label="포지션" value={POSITION_FULL[position] ?? position} />
            </div>
          </div>

          {/* 국가대표 */}
          {national_team.is_national && (
            <>
              <div className="w-full h-px bg-zinc-100 mb-4" />
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">🇰🇷 국가대표</p>
                  <SourceRow sources={[{ label: "공식 출전 기록" }]} />
                </div>
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

          {/* 태그 */}
          {tags.length > 0 && (
            <>
              <div className="w-full h-px bg-zinc-100 mb-4" />
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">특성 태그</p>
                  <SourceRow sources={[{ label: "자체 산정" }]} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setShowTagGuide(true)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-transform ${TAG_COLORS[tag] ?? "bg-zinc-100 text-zinc-600"}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 나무위키 */}
          <a
            href={`https://namu.wiki/w/${encodeURIComponent(name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-2 py-3 rounded-2xl border border-zinc-200 text-zinc-500 text-sm font-semibold flex items-center justify-center gap-1.5 active:bg-zinc-50 transition-colors"
          >
            나무위키에서 자세히 보기
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="w-full mt-2 py-3 rounded-2xl bg-zinc-100 text-zinc-500 text-sm font-semibold active:bg-zinc-200 transition-colors"
          >
            닫기
          </button>
        </div>
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
