import { TN } from "./data";

// ─── 팀 컬러/로고 유틸 ─────────────────────────────────────────────

export type TeamColor = { bg: string; text: string; light: string };

const DEFAULT_TEAM_COLOR: TeamColor = { bg: "#333", text: "white", light: "#f4f4f5" };

/** 팀명 → 팀 컬러 (fallback 포함) */
export function getTeamColor(team: string | null | undefined): TeamColor {
  if (!team) return DEFAULT_TEAM_COLOR;
  return TEAM_COLORS[team] ?? DEFAULT_TEAM_COLOR;
}

/** 팀명 → 로고 URL (없으면 null) */
export function getTeamLogo(team: string | null | undefined): string | null {
  if (!team) return null;
  return TEAM_LOGOS[team] ?? null;
}

// ─── 공통 스타일 상수 ───────────────────────────────────────────────

export const CARD_SHADOW = "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.07)";

export const TAG_FALLBACK_CLASS = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

// ─── 날짜 포맷 ──────────────────────────────────────────────────────

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function formatMatchDate(date: string, time: string) {
  const dateObj = new Date(date);
  const today = new Date().toISOString().slice(0, 10);
  const isToday = date === today;
  const timeShort = time ? time.replace(/:00$/, "시") : "";
  const dateLabel = isToday
    ? `오늘 ${timeShort}`
    : `${dateObj.getMonth() + 1}/${dateObj.getDate()}(${DAYS[dateObj.getDay()]}) ${timeShort}`;
  return { dateObj, today, isToday, timeShort, dateLabel };
}

// ─── 태그 배지 색상 ──────────────────────────────────────────────

export const TAG_COLORS: Record<string, string> = {
  레전드: "bg-amber-100 text-amber-700",
  에이스: "bg-red-100 text-red-700",
  "1옵션": "bg-orange-100 text-orange-700",
  식스맨: "bg-yellow-100 text-yellow-700",
  득점원: "bg-orange-100 text-orange-700",
  수비형: "bg-blue-100 text-blue-700",
  슈터: "bg-sky-100 text-sky-700",
  플레이메이커: "bg-indigo-100 text-indigo-700",
  리바운더: "bg-violet-100 text-violet-700",
  핸들러: "bg-indigo-100 text-indigo-700",
  "공격 전개": "bg-cyan-100 text-cyan-700",
  클러치: "bg-rose-100 text-rose-700",
  "흐름 체인저": "bg-pink-100 text-pink-700",
  안정감: "bg-teal-100 text-teal-700",
  폭발력: "bg-fuchsia-100 text-fuchsia-700",
  국가대표: "bg-green-100 text-green-700",
  신인왕: "bg-lime-100 text-lime-700",
  MVP: "bg-emerald-100 text-emerald-700",
  베테랑: "bg-zinc-100 text-zinc-600",
  "골밑 핵심": "bg-purple-100 text-purple-700",
  윙: "bg-teal-100 text-teal-700",
};

// ─── 팀 컬러 ────────────────────────────────────────────────────

export const TEAM_COLORS: Record<
  string,
  { bg: string; text: string; light: string }
> = {
  // WKBL
  [TN.WOORI]: { bg: "#003DA5", text: "white", light: "#e5ecf7" },
  [TN.HANA]: { bg: "#007B5F", text: "white", light: "#e6f4f0" },
  [TN.SAMSUNG]: { bg: "#1428A0", text: "white", light: "#e8eaf6" },
  [TN.BNK]: { bg: "#E31837", text: "white", light: "#fde8eb" },
  [TN.KB]: { bg: "#CB9E00", text: "white", light: "#fdf6e3" },
  [TN.SHINHAN]: { bg: "#0046FF", text: "white", light: "#e5ebff" },
  // KBL
  [TN.SONO]: { bg: "#0B3D91", text: "white", light: "#e5eaf4" },
  [TN.DB]: { bg: "#FF6B00", text: "white", light: "#fff0e5" },
  [TN.SK]: { bg: "#E31837", text: "white", light: "#fde8eb" },
  [TN.MOBIS]: { bg: "#003DA5", text: "white", light: "#e5ecf7" },
  [TN.KT]: { bg: "#D10000", text: "white", light: "#fce5e5" },
  [TN.LG]: { bg: "#A50034", text: "white", light: "#f5e5eb" },
  [TN.JKJ]: { bg: "#C8102E", text: "white", light: "#fae6ea" },
  [TN.KCC]: { bg: "#1D1D1B", text: "white", light: "#ebebeb" },
  [TN.SAMSUNGM]: { bg: "#034EA2", text: "white", light: "#e5edf7" },
  [TN.GAS]: { bg: "#0072CE", text: "white", light: "#e5f0fa" },
};

// ─── 팀 로고 URL ────────────────────────────────────────────────

export const TEAM_LOGOS: Record<string, string> = {
  // WKBL
  [TN.WOORI]: "https://www.wkbl.or.kr/static/images/team/teamlogo_05.png",
  [TN.HANA]: "https://www.wkbl.or.kr/static/images/team/teamlogo_09.png",
  [TN.SAMSUNG]: "https://www.wkbl.or.kr/static/images/team/teamlogo_03.png",
  [TN.BNK]: "https://www.wkbl.or.kr/static/images/team/teamlogo_11.png",
  [TN.KB]: "https://www.wkbl.or.kr/static/images/team/teamlogo_01.png",
  [TN.SHINHAN]: "https://www.wkbl.or.kr/static/images/team/teamlogo_07.png",
  // KBL (kbl.or.kr 공식 SVG)
  [TN.SONO]: "https://www.kbl.or.kr/assets/img/ico/logo/ic-sono.svg",
  [TN.DB]: "https://www.kbl.or.kr/assets/img/ico/logo/ic-db.svg",
  [TN.SK]: "https://www.kbl.or.kr/assets/img/ico/logo/ic-sk.svg",
  [TN.MOBIS]: "https://www.kbl.or.kr/assets/img/ico/logo/ic-hd.svg",
  [TN.KT]: "https://www.kbl.or.kr/assets/img/ico/logo/ic-kt.svg",
  [TN.LG]: "https://www.kbl.or.kr/assets/img/ico/logo/ic-lg.svg",
  [TN.JKJ]: "https://www.kbl.or.kr/assets/img/ico/logo/ic-kgc.svg",
  [TN.KCC]: "https://www.kbl.or.kr/assets/img/ico/logo/ic-kcc.svg",
  [TN.SAMSUNGM]: "https://www.kbl.or.kr/assets/img/ico/logo/ic-ss.svg",
  [TN.GAS]: "https://www.kbl.or.kr/assets/img/ico/logo/ic-pega.svg",
};
