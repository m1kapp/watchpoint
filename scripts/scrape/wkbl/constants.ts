/**
 * WKBL 크롤링 코드 전용 상수
 *
 * 팀 정보(이름, tcode 등)는 data/wkbl/teams.json 참조.
 * 국가대표 명단은 data/wkbl/national-team.json 참조.
 * 여기는 URL 패턴 / 시즌 코드 등 코드 레벨 상수만 둡니다.
 */

// ─── 시즌 ────────────────────────────────────────────────────────────────────

/** 현재 시즌 코드 — 새 시즌 시작 시 여기만 올립니다 */
export const CURRENT_SEASON_GU = "046";

/** season_gu → 시즌 표기 */
export const SEASON_GU_MAP: Record<string, string> = {
  "044": "2023-24",
  "045": "2024-25",
  "046": "2025-26",
};

// ─── 경기 타입 ───────────────────────────────────────────────────────────────

/** WKBL game_type 코드 → 라운드 이름 */
export const GAME_TYPE_MAP: Record<string, string> = {
  "01": "정규시즌",
  "02": "준플레이오프",
  "03": "플레이오프",
  "04": "챔피언결정전",
};

// ─── URL 헬퍼 ────────────────────────────────────────────────────────────────

export const WKBL_BASE = "https://www.wkbl.or.kr";

export const WKBL_URLS = {
  playerList:   (tcode: string) =>
    `${WKBL_BASE}/player/player_list.asp?player_group=12&tcode=${tcode}`,
  playerDetail: (tcode: string, pno: string) =>
    `${WKBL_BASE}/player/detail.asp?player_group=12&tcode=${tcode}&pno=${pno}`,
  playerStats:  () =>
    `${WKBL_BASE}/player/ajax/ajax_detail_season.asp`,
  gameResult:   (gameType: string, gameNo: number) =>
    `${WKBL_BASE}/game/result.asp?season_gu=${CURRENT_SEASON_GU}&game_type=${gameType}&game_no=${gameNo}`,
  playoff:      () => `${WKBL_BASE}/event/playoff2526/`,
  logoImg:      (logoNo: string) =>
    `${WKBL_BASE}/static/images/team/teamlogo_${logoNo}.png`,
};

export const NAVER_SCORES_URL = (fromDate: string, toDate: string) =>
  `https://api-gw.sports.naver.com/schedule/games?fields=basic,schedule&superCategoryId=basketball&categoryId=wkbl&fromDate=${fromDate}&toDate=${toDate}&size=500`;
