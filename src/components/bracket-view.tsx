"use client";

import { getTeamColor, getTeamLogo } from "@/lib/team-styles";
import type { MatchData } from "@/lib/match-types";

type MatchWithId = MatchData & { id: string };

// ─── 유틸 ────────────────────────────────────────────────────
function getWinner(m: MatchWithId): string | null {
  if (!m.match.score) return null;
  return m.match.score.home > m.match.score.away ? m.match.home : m.match.away;
}

function computeSeries(matches: MatchWithId[], teamA: string, teamB: string) {
  const games = matches
    .filter((m) => {
      const t = [m.match.home, m.match.away];
      return t.includes(teamA) && t.includes(teamB);
    })
    .sort((a, b) => a.match.date.localeCompare(b.match.date));

  let winsA = 0, winsB = 0;
  const gameResults: (string | null)[] = [];
  for (const m of games) {
    const w = getWinner(m);
    gameResults.push(w);
    if (w === teamA) winsA++;
    else if (w === teamB) winsB++;
  }
  return {
    games,
    winsA,
    winsB,
    gameResults,
  };
}

function seriesWinner(winsA: number, winsB: number, bestOf: number, teamA: string | null, teamB: string | null): string | null {
  const toWin = Math.ceil((bestOf + 1) / 2);
  if (winsA >= toWin) return teamA;
  if (winsB >= toWin) return teamB;
  return null;
}

// ─── 게임 진행 닷 ────────────────────────────────────────────
function GameDots({
  bestOf,
  gameResults,
  teamA,
  teamB,
}: {
  bestOf: number;
  gameResults: (string | null)[];
  teamA: string | null;
  teamB: string | null;
}) {
  const colorA = getTeamColor(teamA).bg;
  const colorB = getTeamColor(teamB).bg;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: bestOf }).map((_, i) => {
        const winner = gameResults[i] ?? null;
        const played = i < gameResults.length;
        let color = "#e4e4e7"; // unplayed
        if (played && winner === teamA) color = colorA;
        else if (played && winner === teamB) color = colorB;
        else if (played && !winner) color = "#a1a1aa";
        return (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: played ? 7 : 5,
              height: played ? 7 : 5,
              backgroundColor: color,
              opacity: played ? 1 : 0.5,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── 팀 행 ───────────────────────────────────────────────────
function BracketTeamRow({
  name, rank, wins, isWinner, isEliminated,
}: {
  name: string | null; rank?: number; wins: number;
  isWinner: boolean; isEliminated: boolean;
}) {
  const colors = name ? getTeamColor(name) : null;
  const logo = getTeamLogo(name);

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2.5 transition-all"
      style={
        isWinner && colors
          ? { backgroundColor: `${colors.bg}12` }
          : undefined
      }
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo} alt={name!}
          className="w-7 h-7 object-contain shrink-0"
          style={{ opacity: isEliminated ? 0.3 : 1 }}
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center">
          <span className="text-zinc-300 text-xs">?</span>
        </div>
      )}

      <div className="flex-1 min-w-0" style={{ opacity: isEliminated ? 0.3 : 1 }}>
        {rank !== undefined && name && colors && (
          <span
            className="text-[9px] font-black block leading-none mb-0.5"
            style={{ color: colors.bg }}
          >
            {rank}위
          </span>
        )}
        <p
          className={`text-[12px] font-black leading-tight truncate ${
            name ? "text-zinc-900 dark:text-white" : "text-zinc-300 dark:text-zinc-600"
          }`}
        >
          {name ?? "미정"}
        </p>
      </div>

      {name && (
        <span
          className="text-2xl font-black tabular-nums leading-none shrink-0"
          style={{
            color: isWinner
              ? colors?.bg
              : "#d4d4d8",
          }}
        >
          {wins}
        </span>
      )}
    </div>
  );
}

// ─── 시리즈 블록 ─────────────────────────────────────────────
function SeriesBlock({
  teamA, teamB, rankA, rankB, winsA, winsB, winner, bestOf = 5,
  gameResults = [], byeLabel, onClick,
}: {
  teamA: string | null; teamB: string | null;
  rankA?: number; rankB?: number;
  winsA: number; winsB: number;
  winner: string | null;
  bestOf?: number;
  gameResults?: (string | null)[];
  byeLabel?: string;
  onClick?: () => void;
}) {
  const toWin = Math.ceil((bestOf + 1) / 2);

  return (
    <button
      onClick={onClick}
      className="w-full bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden text-left active:scale-[0.97] transition-transform"
      style={{
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.08)",
        width: 164,
      }}
      disabled={!onClick}
    >
      <BracketTeamRow
        name={teamA} rank={rankA} wins={winsA}
        isWinner={winner === teamA}
        isEliminated={!!winner && winner !== teamA}
      />
      {byeLabel && teamA && !teamB && (
        <div className="mx-3 -mt-1 mb-1">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
            {byeLabel}
          </span>
        </div>
      )}
      <div className="mx-3 border-t border-zinc-100 dark:border-zinc-800" />
      <BracketTeamRow
        name={teamB} rank={rankB} wins={winsB}
        isWinner={winner === teamB}
        isEliminated={!!winner && winner !== teamB}
      />

      <div className="px-3 pt-1.5 pb-2.5 flex items-center justify-between">
        <GameDots
          bestOf={bestOf}
          gameResults={gameResults}
          teamA={teamA}
          teamB={teamB}
        />
        <span className="text-[8px] text-zinc-300 dark:text-zinc-600 font-semibold tracking-tight">
          {bestOf}전 {toWin}선승
        </span>
      </div>
    </button>
  );
}

// ─── BYE 카드 (부전승/직행) ──────────────────────────────────
function ByeBlock({ name, rank, label }: { name: string; rank: number; label: string }) {
  const colors = getTeamColor(name);
  const logo = getTeamLogo(name);

  return (
    <div
      className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden"
      style={{
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.08)",
        width: 164,
      }}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={name} className="w-7 h-7 object-contain shrink-0" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-black block leading-none mb-0.5" style={{ color: colors.bg }}>
            {rank}위
          </span>
          <p className="text-[12px] font-black text-zinc-900 dark:text-white leading-tight truncate">{name}</p>
        </div>
      </div>
      <div className="px-3 pb-2.5">
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── 라운드 간 커넥터 (SVG) ──────────────────────────────────
function BracketConnector({ inSlots, outSlots = 1 }: { inSlots: number; outSlots?: number }) {
  const inCenters  = Array.from({ length: inSlots  }, (_, i) => ((2 * i + 1) / (2 * inSlots))  * 100);
  const outCenters = Array.from({ length: outSlots }, (_, i) => ((2 * i + 1) / (2 * outSlots)) * 100);

  const W = 36;
  const mid = W / 2;
  const parts: string[] = [];

  if (inSlots === outSlots) {
    // 1:1 매칭
    for (let i = 0; i < inSlots; i++) {
      parts.push(`M 0 ${inCenters[i]} L ${W} ${outCenters[i]}`);
    }
  } else if (outSlots > 1 && inSlots % outSlots === 0) {
    // 그룹별 합류 — N:M에서 (inSlots/outSlots)개씩 묶어서 각 outSlot으로
    // 예: 4→2 → [0,1]→0, [2,3]→1
    const groupSize = inSlots / outSlots;
    for (let g = 0; g < outSlots; g++) {
      const groupIn = inCenters.slice(g * groupSize, (g + 1) * groupSize);
      const outY = outCenters[g];
      // 왼쪽 arm
      groupIn.forEach(y => parts.push(`M 0 ${y} H ${mid}`));
      // 세로 연결
      if (groupIn.length > 1) {
        parts.push(`M ${mid} ${groupIn[0]} V ${groupIn[groupIn.length - 1]}`);
      }
      // 오른쪽 arm
      parts.push(`M ${mid} ${outY} H ${W}`);
    }
  } else {
    // 기본 합류 — 전체를 하나로
    inCenters.forEach(y => parts.push(`M 0 ${y} H ${mid}`));
    if (inSlots > 1) parts.push(`M ${mid} ${inCenters[0]} V ${inCenters[inSlots - 1]}`);
    outCenters.forEach(y => parts.push(`M ${mid} ${y} H ${W}`));
  }

  return (
    <svg
      style={{ width: W }}
      className="flex-1 w-full"
      viewBox={`0 0 ${W} 100`}
      preserveAspectRatio="none"
    >
      <path
        d={parts.join(" ")}
        fill="none"
        stroke="#a1a1aa"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// ─── 타입 ────────────────────────────────────────────────────
type SeriesData = {
  teamA: string | null; teamB: string | null;
  rankA?: number; rankB?: number;
  winsA: number; winsB: number;
  winner: string | null;
  bestOf?: number;
  gameResults?: (string | null)[];
  isBye?: boolean; // 부전승 팀 (4강 직행 등)
  byeLabel?: string;
  onClickMatch?: () => void;
};

// ─── 대진표 데이터 빌드 (WKBL) ──────────────────────────────
function buildWkblBracket(matches: MatchWithId[]): { label: string; series: SeriesData[] }[] {
  const kb   = computeSeries(matches, "KB스타즈", "우리은행");
  const hana = computeSeries(matches, "하나은행", "삼성생명");

  const kbWinner   = seriesWinner(kb.winsA, kb.winsB, 5, "KB스타즈", "우리은행");
  const hanaWinner = seriesWinner(hana.winsA, hana.winsB, 5, "하나은행", "삼성생명");

  const champ = kbWinner && hanaWinner
    ? computeSeries(matches, kbWinner, hanaWinner)
    : { winsA: 0, winsB: 0, gameResults: [] };
  const champWinner = kbWinner && hanaWinner
    ? seriesWinner(champ.winsA, champ.winsB, 7, kbWinner, hanaWinner)
    : null;

  return [
    {
      label: "플레이오프",
      series: [
        { teamA: "KB스타즈", teamB: "우리은행", rankA: 1, rankB: 4, ...kb, winner: kbWinner, bestOf: 5 },
        { teamA: "하나은행", teamB: "삼성생명", rankA: 2, rankB: 3, ...hana, winner: hanaWinner, bestOf: 5 },
      ],
    },
    {
      label: "챔피언결정전",
      series: [
        { teamA: kbWinner, teamB: hanaWinner, ...champ, winner: champWinner, bestOf: 7 },
      ],
    },
  ];
}

// ─── 대진표 데이터 빌드 (KBL) ───────────────────────────────
function buildKblBracket(matches: MatchWithId[]): { label: string; series: SeriesData[] }[] {
  // 6강 PO: 4위vs5위 (SK vs 소노), 3위vs6위 (DB vs KCC)
  const po6a = computeSeries(matches, "SK", "소노");
  const po6b = computeSeries(matches, "DB", "KCC");

  const po6aWinner = seriesWinner(po6a.winsA, po6a.winsB, 5, "SK", "소노");
  const po6bWinner = seriesWinner(po6b.winsA, po6b.winsB, 5, "DB", "KCC");

  // 준PO: 1위(LG) vs 6강 승자A, 2위(정관장) vs 6강 승자B
  // KBL 준PO 규칙: 1위 vs 하위 시드 승자, 2위 vs 상위 시드 승자
  // 3vs6 승자(하위시드)는 1위와, 4vs5 승자(상위시드)는 2위와 대결
  const semiFinalA = po6aWinner
    ? computeSeries(matches, "LG", po6aWinner)
    : { winsA: 0, winsB: 0, gameResults: [] };
  const semiFinalB = po6bWinner
    ? computeSeries(matches, "정관장", po6bWinner)
    : { winsA: 0, winsB: 0, gameResults: [] };

  const semiAWinner = po6aWinner
    ? seriesWinner(semiFinalA.winsA, semiFinalA.winsB, 5, "LG", po6aWinner)
    : null;
  const semiBWinner = po6bWinner
    ? seriesWinner(semiFinalB.winsA, semiFinalB.winsB, 5, "정관장", po6bWinner)
    : null;

  // 챔피언결정전
  const champ = semiAWinner && semiBWinner
    ? computeSeries(matches, semiAWinner, semiBWinner)
    : { winsA: 0, winsB: 0, gameResults: [] };
  const champWinner = semiAWinner && semiBWinner
    ? seriesWinner(champ.winsA, champ.winsB, 7, semiAWinner, semiBWinner)
    : null;

  return [
    {
      label: "6강 PO",
      series: [
        { teamA: "LG", teamB: null, rankA: 1, winsA: 0, winsB: 0, winner: null, isBye: true, byeLabel: "4강 직행" },
        { teamA: "SK", teamB: "소노", rankA: 4, rankB: 5, ...po6a, winner: po6aWinner, bestOf: 5 },
        { teamA: "DB", teamB: "KCC", rankA: 3, rankB: 6, ...po6b, winner: po6bWinner, bestOf: 5 },
        { teamA: "정관장", teamB: null, rankA: 2, winsA: 0, winsB: 0, winner: null, isBye: true, byeLabel: "4강 직행" },
      ],
    },
    {
      label: "4강 PO",
      series: [
        { teamA: "LG", teamB: po6aWinner, rankA: 1, ...semiFinalA, winner: semiAWinner, bestOf: 5 },
        { teamA: "정관장", teamB: po6bWinner, rankA: 2, ...semiFinalB, winner: semiBWinner, bestOf: 5 },
      ],
    },
    {
      label: "챔피언결정전",
      series: [
        { teamA: semiAWinner, teamB: semiBWinner, ...champ, winner: champWinner, bestOf: 7 },
      ],
    },
  ];
}

// ─── 메인 ────────────────────────────────────────────────────
export function BracketView({
  matches,
  league,
  onMatchClick,
}: {
  matches: MatchWithId[];
  league: "WKBL" | "KBL";
  onMatchClick: (m: MatchWithId) => void;
}) {
  const rounds = league === "KBL"
    ? buildKblBracket(matches)
    : buildWkblBracket(matches);

  const LABEL_H = 21;

  return (
    <div className="overflow-x-auto">
      <div
        className="flex items-stretch px-4 pt-3 pb-8"
        style={{ minWidth: rounds.length * 164 + (rounds.length - 1) * 36 + 32 }}
      >
        {rounds.map((round, ri) => {
          const prevRound  = ri > 0 ? rounds[ri - 1] : null;
          const isLast     = ri === rounds.length - 1;

          return (
            <div key={ri} className="flex items-stretch">
              {prevRound && (
                <div
                  className="self-stretch flex flex-col shrink-0"
                  style={{ paddingTop: LABEL_H, width: 36 }}
                >
                  <BracketConnector
                    inSlots={prevRound.series.length}
                    outSlots={round.series.length}
                  />
                </div>
              )}

              <div className="flex flex-col shrink-0" style={{ width: 164 }}>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1 mb-2.5">
                  {round.label}
                </p>

                {!isLast ? (
                  <div
                    className="flex-1"
                    style={{
                      display: "grid",
                      gridTemplateRows: `repeat(${round.series.length}, 1fr)`,
                    }}
                  >
                    {round.series.map((s, si) => (
                      <div key={si} className="flex items-center py-1.5">
                        {s.isBye && s.teamA ? (
                          <ByeBlock name={s.teamA} rank={s.rankA!} label={s.byeLabel ?? "직행"} />
                        ) : (
                          <SeriesBlock {...s} />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col flex-1 justify-center gap-3">
                    {round.series.map((s, si) => (
                      <SeriesBlock key={si} {...s} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
