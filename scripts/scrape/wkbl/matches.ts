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

// teamId → stadium (홈구장)
const HOME_STADIUM = Object.fromEntries(teamsJson.map((t) => [t.teamId, t.stadium]));

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

/** 로고 img src에서 teamId 추출 */
function logoToTeamId(src: string): string | null {
  const m = src.match(/teamlogo_(\d+)/);
  if (!m) return null;
  return LOGO_MAP[m[1]]?.teamId ?? null;
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
  leftTeamId: string | null;
  rightTeamId: string | null;
  neutralVenue?: string;
  leftScore: number | null;
  rightScore: number | null;
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
    const leftTeamId  = logoToTeamId(leftLogoSrc);
    const rightTeamId = logoToTeamId(rightLogoSrc);

    // 점수
    const leftScore  = parseInt($li.find(".score_left .number").text().trim()) || null;
    const rightScore = parseInt($li.find(".score_right .number").text().trim()) || null;

    // 날짜/시간
    const scheduleText = $li.find(".schedule > p").first().text().trim();
    const { date, time } = parseScheduleText(scheduleText);

    // 장소 — 홈팀 구장과 다를 때만 neutralVenue로 저장
    const location = $li.find(".place").text().trim() || null;
    const homeStadium = leftTeamId ? HOME_STADIUM[leftTeamId] : null;
    const neutralVenue = location && location !== homeStadium ? location : undefined;

    // 경기 기록 링크 (javascript:; 제외)
    const recordHref = $li.find(".btns a").first().attr("href") ?? "";
    const isValidHref = (h: string) => h && !h.startsWith("javascript");
    const gameRecordUrl = isValidHref(recordHref) ? `${BASE_URL}${recordHref}` : null;
    const photoHref = $li.find(".btns a.line").attr("href") ?? "";
    const photoUrl = isValidHref(photoHref) ? `${BASE_URL}${photoHref}` : null;

    // 경기 번호 & 라운드
    const gameMeta = parseGameUrl(recordHref);
    const gameNo = gameMeta.gameNo ? parseInt(gameMeta.gameNo) : null;
    const gameTypeName = GAME_TYPE_MAP[gameMeta.gameType ?? ""] ?? "플레이오프";
    const stage = gameNo ? `${gameTypeName} ${gameNo}차전` : gameTypeName;

    const match: ScrapedMatch = {
      stage,
      gameNo,
      date,
      time,
      leftTeamId,
      rightTeamId,
      leftScore: isNaN(leftScore as number) ? null : leftScore,
      rightScore: isNaN(rightScore as number) ? null : rightScore,
      isFinished,
      gameRecordUrl,
      photoUrl,
    };
    if (neutralVenue) match.neutralVenue = neutralVenue;

    matches.push(match);
  });

  return matches;
}

// date + 양팀 조합(순서 무관) → 유일 키
function makeKey(a: string, b: string, date: string) {
  return `${date}|${[a, b].sort().join("|")}`;
}

async function main() {
  console.log("🏀 WKBL 플레이오프 일정 크롤링 시작\n");

  const dataDir = process.env.WKBL_DATA_DIR ?? "data/wkbl";
  await fs.mkdir(path.resolve(process.cwd(), dataDir), { recursive: true });
  const outputPath = path.resolve(process.cwd(), `${dataDir}/matches.json`);

  // 기존 JSON 읽기 (에디토리얼 데이터 보존)
  const existingRaw = await fs.readFile(outputPath, "utf-8").catch(() => "[]");
  const existing: any[] = JSON.parse(existingRaw);

  const html = await fetchHtml(PLAYOFF_URL);
  const scraped = parseMatches(html);

  console.log(`발견된 경기: ${scraped.length}건\n`);

  // 기존 항목 인덱스 맵
  const existingMap = new Map<string, any>(
    existing.map((e) => [makeKey(e.leftTeamId, e.rightTeamId, e.date), e])
  );

  let updated = 0, added = 0;

  for (const m of scraped) {
    if (!m.date || !m.leftTeamId || !m.rightTeamId) continue;
    const key = makeKey(m.leftTeamId, m.rightTeamId, m.date);
    const entry = existingMap.get(key);

    if (entry) {
      // 스크래퍼 필드만 업데이트 (에디토리얼 필드 보존)
      entry.leftScore      = m.leftScore;
      entry.rightScore     = m.rightScore;
      entry.isFinished     = m.isFinished;
      entry.time           = m.time;
      entry.gameRecordUrl  = m.gameRecordUrl;
      entry.photoUrl       = m.photoUrl;
      if (m.gameNo != null) entry.gameNo = m.gameNo;
      updated++;
    } else {
      // 새 경기 — id/에디토리얼은 비워두고 추가
      existing.push({
        id: null,
        stage: m.stage,
        date: m.date,
        time: m.time,
        location: null,
        leftTeamId: m.leftTeamId,
        rightTeamId: m.rightTeamId,
        leftScore: m.leftScore,
        rightScore: m.rightScore,
        isFinished: m.isFinished,
        gameNo: m.gameNo,
        gameRecordUrl: m.gameRecordUrl,
        photoUrl: m.photoUrl,
        teams: [], coaches: [], players: [],
      });
      existingMap.set(key, existing[existing.length - 1]);
      added++;
    }

    const left  = m.leftTeamId;
    const right = m.rightTeamId;
    const score = m.isFinished ? `${m.leftScore ?? "-"}:${m.rightScore ?? "-"}` : "미정";
    const winner = m.isFinished && m.leftScore != null && m.rightScore != null
      ? (m.leftScore > m.rightScore ? `${left} 승` : `${right} 승`)
      : "";
    console.log(`  ${m.date} ${m.time ?? "??:??"} | ${left} vs ${right} | ${score} ${winner} | ${m.stage}`);
  }

  // 날짜순 정렬
  existing.sort((a, b) => a.date.localeCompare(b.date));

  await fs.writeFile(outputPath, JSON.stringify(existing, null, 2), "utf-8");
  console.log(`\n✅ 저장 완료 → ${outputPath} (갱신 ${updated}건, 신규 ${added}건)`);
}

main().catch(console.error);
