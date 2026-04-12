/**
 * WKBL 플레이오프 일정 크롤러
 *
 * 실행: npx tsx scripts/scrape/wkbl-matches.ts
 * 출력: data/wkbl/matches.json
 */

import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";
import { GAME_TYPE_MAP, WKBL_BASE, WKBL_URLS } from "./constants";
import teamsJson from "../../../data/wkbl/teams.json" with { type: "json" };

const BASE_URL = WKBL_BASE;
const PLAYOFF_URL = WKBL_URLS.playoff();

// tcode(= logoNo) → 팀 정보
const LOGO_MAP = Object.fromEntries(teamsJson.map((t) => [t.tcode, t]));

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Referer: BASE_URL,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

/** 로고 img src에서 팀 번호 추출 */
function logoToTeam(src: string): { teamId: string; teamName: string } | null {
  const m = src.match(/teamlogo_(\d+)/);
  if (!m) return null;
  return LOGO_MAP[m[1]] ?? null;
}

/** "04.08(화) 18:59" → { date: "2026-04-08", time: "18:59" } */
function parseScheduleText(text: string, year = 2026): { date: string | null; time: string | null } {
  const datePart = text.match(/(\d{2})\.(\d{2})/);
  const timePart = text.match(/(\d{1,2}):(\d{2})/);
  return {
    date: datePart
      ? `${year}-${datePart[1]}-${datePart[2]}`
      : null,
    time: timePart
      ? `${timePart[1].padStart(2, "0")}:${timePart[2]}`
      : null,
  };
}

/** 경기기록 URL에서 메타 파싱 */
function parseGameUrl(href: string): {
  seasonGu: string | null;
  gun: string | null;
  gameType: string | null;
  gameNo: string | null;
} {
  const params = new URLSearchParams(href.split("?")[1] ?? "");
  return {
    seasonGu: params.get("season_gu"),
    gun: params.get("gun"),
    gameType: params.get("game_type"),
    gameNo: params.get("game_no"),
  };
}

interface ScrapedMatch {
  stage: string;
  gameNo: number | null;
  date: string | null;
  time: string | null;
  location: string | null;
  leftTeam: { teamId: string; teamName: string } | null;
  rightTeam: { teamId: string; teamName: string } | null;
  leftScore: number | null;
  rightScore: number | null;
  leftWin: boolean;
  rightWin: boolean;
  isFinished: boolean;
  gameRecordUrl: string | null;
  photoUrl: string | null;
}

function parseMatches(html: string): ScrapedMatch[] {
  const $ = cheerio.load(html);
  const matches: ScrapedMatch[] = [];

  // 각 li가 하나의 경기
  $("section.content li").each((_, li) => {
    const $li = $(li);
    const isFinished = $li.hasClass("end");

    // 팀 로고로 팀 식별
    const leftLogoSrc  = $li.find(".team_left img").attr("src") ?? "";
    const rightLogoSrc = $li.find(".team_right img").attr("src") ?? "";
    const leftTeam  = logoToTeam(leftLogoSrc);
    const rightTeam = logoToTeam(rightLogoSrc);

    // 점수
    const leftScore  = parseInt($li.find(".score_left .number").text().trim()) || null;
    const rightScore = parseInt($li.find(".score_right .number").text().trim()) || null;
    const leftWin    = $li.find(".score_left").hasClass("win");
    const rightWin   = $li.find(".score_right").hasClass("win");

    // 날짜/시간
    const scheduleText = $li.find(".schedule > p").first().text().trim();
    const { date, time } = parseScheduleText(scheduleText);

    // 장소
    const location = $li.find(".place").text().trim() || null;

    // 경기 기록 링크
    const recordHref = $li.find(".btns a").first().attr("href") ?? "";
    const gameRecordUrl = recordHref
      ? `${BASE_URL}${recordHref}`
      : null;
    const photoHref = $li.find(".btns a.line").attr("href") ?? "";
    const photoUrl = photoHref ? `${BASE_URL}${photoHref}` : null;

    // 경기 번호 & 라운드
    const gameMeta = parseGameUrl(recordHref);
    const gameNo = gameMeta.gameNo ? parseInt(gameMeta.gameNo) : null;
    const gameTypeName = GAME_TYPE_MAP[gameMeta.gameType ?? ""] ?? "플레이오프";
    const stage = `${gameTypeName} ${gameNo}차전`;

    matches.push({
      stage,
      gameNo,
      date,
      time,
      location,
      leftTeam,
      rightTeam,
      leftScore: isNaN(leftScore as number) ? null : leftScore,
      rightScore: isNaN(rightScore as number) ? null : rightScore,
      leftWin,
      rightWin,
      isFinished,
      gameRecordUrl,
      photoUrl,
    });
  });

  return matches;
}

async function main() {
  console.log("🏀 WKBL 플레이오프 일정 크롤링 시작\n");

  const html = await fetchHtml(PLAYOFF_URL);
  const matches = parseMatches(html);

  console.log(`발견된 경기: ${matches.length}건\n`);
  matches.forEach((m, i) => {
    const left  = m.leftTeam?.teamName  ?? "?";
    const right = m.rightTeam?.teamName ?? "?";
    const score = m.isFinished
      ? `${m.leftScore ?? "-"}:${m.rightScore ?? "-"}`
      : "미정";
    const win = m.leftWin ? `${left} 승` : m.rightWin ? `${right} 승` : "";
    console.log(
      `  [${String(i + 1).padStart(2)}] ${m.date ?? "날짜??"} ${m.time ?? "  ??  "} | ${left} vs ${right} | ${score} ${win} | ${m.stage}`
    );
  });

  const outputPath = path.resolve(process.cwd(), "data/wkbl/matches.json");
  await fs.writeFile(outputPath, JSON.stringify(matches, null, 2), "utf-8");
  console.log(`\n✅ 저장 완료 → ${outputPath}`);
}

main().catch(console.error);
