"use client";

import { TEAM_COLORS, TEAM_LOGOS } from "@/lib/matches";
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
    winner: winsA >= 3 ? teamA : winsB >= 3 ? teamB : null,
  };
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
  const colorA = teamA ? (TEAM_COLORS[teamA]?.bg ?? "#71717a") : "#71717a";
  const colorB = teamB ? (TEAM_COLORS[teamB]?.bg ?? "#71717a") : "#71717a";

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: bestOf }).map((_, i) => {
        const winner = gameResults[i] ?? null;
        const played = i < gameResults.length;
        let color = "#e4e4e7"; // unplayed
        if (played && winner === teamA) color = colorA;
        else if (played && winner === teamB) color = colorB;
        else if (played && !winner) color = "#a1a1aa"; // 무
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
  const colors = name ? (TEAM_COLORS[name] ?? { bg: "#71717a", light: "#f4f4f5" }) : null;
  const logo = name ? TEAM_LOGOS[name] : null;

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2.5 transition-all"
      style={
        isWinner && colors
          ? { backgroundColor: `${colors.bg}12` }
          : undefined
      }
    >
      {/* 로고 */}
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

      {/* 이름 */}
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

      {/* 승수 */}
      {name && (
        <span
          className="text-2xl font-black tabular-nums leading-none shrink-0"
          style={{
            color: isWinner
              ? colors?.bg
              : isEliminated
              ? "#d4d4d8"
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
  gameResults = [], onClick,
}: {
  teamA: string | null; teamB: string | null;
  rankA?: number; rankB?: number;
  winsA: number; winsB: number;
  winner: string | null;
  bestOf?: number;
  gameResults?: (string | null)[];
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
      <div className="mx-3 border-t border-zinc-100 dark:border-zinc-800" />
      <BracketTeamRow
        name={teamB} rank={rankB} wins={winsB}
        isWinner={winner === teamB}
        isEliminated={!!winner && winner !== teamB}
      />

      {/* 게임 진행 닷 */}
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

// ─── 라운드 간 커넥터 (SVG) ──────────────────────────────────
// inSlots: 왼쪽 시리즈 수, outSlots: 오른쪽 시리즈 수
// 왼쪽 컬럼이 grid 1fr*N 이면 각 슬롯 중심은 정확히 (2i+1)/(2N) * 100
function BracketConnector({ inSlots, outSlots = 1 }: { inSlots: number; outSlots?: number }) {
  const inCenters  = Array.from({ length: inSlots  }, (_, i) => ((2 * i + 1) / (2 * inSlots))  * 100);
  const outCenters = Array.from({ length: outSlots }, (_, i) => ((2 * i + 1) / (2 * outSlots)) * 100);

  const parts: string[] = [];

  // 왼쪽 arm: 각 inCenter → 중간 x=12
  inCenters.forEach(y => parts.push(`M 0 ${y} H 12`));

  // 세로 연결선 (inCenter 첫 ~ 마지막)
  if (inSlots > 1) parts.push(`M 12 ${inCenters[0]} V ${inCenters[inSlots - 1]}`);

  // 오른쪽 arm: outCenter → 중간 x=12
  // (현재는 outSlots=1만 사용하지만 확장 가능)
  outCenters.forEach(y => parts.push(`M 12 ${y} H 24`));

  return (
    <svg
      style={{ width: 24 }}
      className="flex-1 w-full"
      viewBox="0 0 24 100"
      preserveAspectRatio="none"
    >
      <path
        d={parts.join(" ")}
        fill="none"
        stroke="#d4d4d8"
        strokeWidth="1.5"
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
  onClickMatch?: () => void;
};

// ─── 메인 ────────────────────────────────────────────────────
export function BracketView({
  matches,
  onMatchClick,
}: {
  matches: MatchWithId[];
  onMatchClick: (m: MatchWithId) => void;
}) {
  const kb   = computeSeries(matches, "KB스타즈", "우리은행");
  const hana = computeSeries(matches, "하나은행", "삼성생명");

  const rounds: { label: string; series: SeriesData[] }[] = [
    {
      label: "플레이오프",
      series: [
        { teamA: "KB스타즈", teamB: "우리은행", rankA: 1, rankB: 4, ...kb, bestOf: 5 },
        { teamA: "하나은행", teamB: "삼성생명", rankA: 2, rankB: 3, ...hana, bestOf: 5 },
      ],
    },
    {
      label: "챔피언결정전",
      series: [
        { teamA: kb.winner, teamB: hana.winner, winsA: 0, winsB: 0, winner: null, bestOf: 7, gameResults: [] },
      ],
    },
  ];

  const LABEL_H = 21; // 라운드 레이블 높이 (px) — 커넥터 paddingTop과 일치

  return (
    <div className="overflow-x-auto">
      <div
        className="flex items-stretch px-4 pt-3 pb-8"
        style={{ minWidth: rounds.length * 164 + (rounds.length - 1) * 24 + 32 }}
      >
        {rounds.map((round, ri) => {
          const prevRound  = ri > 0 ? rounds[ri - 1] : null;
          const isLast     = ri === rounds.length - 1;

          return (
            <div key={ri} className="flex items-stretch">
              {/* ── 커넥터 ── */}
              {prevRound && (
                <div
                  className="self-stretch flex flex-col shrink-0"
                  style={{ paddingTop: LABEL_H, width: 24 }}
                >
                  <BracketConnector
                    inSlots={prevRound.series.length}
                    outSlots={round.series.length}
                  />
                </div>
              )}

              {/* ── 라운드 컬럼 ── */}
              <div className="flex flex-col shrink-0" style={{ width: 164 }}>
                {/* 레이블 */}
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1 mb-2.5">
                  {round.label}
                </p>

                {/*
                  왼쪽 컬럼(다음 라운드가 있는 경우): grid 1fr*N
                    → 각 슬롯 중심이 수학적으로 정확히 (2i+1)/(2N) 위치
                  오른쪽 컬럼(마지막): flex + justify-center
                    → 단일 카드가 정확히 50% 위치
                */}
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
                        <SeriesBlock {...s} />
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
