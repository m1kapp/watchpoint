/**
 * KBL 크롤링 코드 전용 상수
 *
 * 팀 정보(이름, 코드 등)는 data/kbl/teams.json 참조.
 * 여기는 URL 패턴 / 시즌 코드 등 코드 레벨 상수만 둡니다.
 */

// ─── 시즌 ────────────────────────────────────────────────────────────────────

/** 현재 시즌 표기 */
export const CURRENT_SEASON = "2025-26";

// ─── 경기 타입 ───────────────────────────────────────────────────────────────

/** Naver roundCode → 라운드 이름 */
export const ROUND_CODE_MAP: Record<string, string> = {
  kbl_r: "정규시즌",
  kbl_ps_6_po: "6강 플레이오프",
  kbl_ps_4_po: "준플레이오프",
  kbl_ps_cp: "챔피언결정전",
};

// ─── URL 헬퍼 ────────────────────────────────────────────────────────────────

export const NAVER_SCORES_URL = (fromDate: string, toDate: string) =>
  `https://api-gw.sports.naver.com/schedule/games?fields=basic,schedule&superCategoryId=basketball&categoryId=kbl&fromDate=${fromDate}&toDate=${toDate}&size=500`;

/** Naver 팀 엠블럼 URL */
export const NAVER_EMBLEM_URL = (teamCode: string) =>
  `https://sports-phinf.pstatic.net/team/kbl/default/${teamCode}.png`;

// ─── KBL 시즌 기간 ──────────────────────────────────────────────────────────

export const SEASON_FROM = "2025-10-01";
export const SEASON_TO = "2026-06-30";
