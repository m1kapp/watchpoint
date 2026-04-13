/**
 * KBL 선수 바이오 데이터 보강 (KBL 공식 API — sports2i)
 *
 * 실행: npx tsx scripts/scrape/kbl/bio.ts
 * 입출력: data/kbl/players.json (기존 파일 덮어쓰기)
 *
 * 보강 필드: height, weight, nameEn, birthDate, birthYear, school
 *
 * API:
 *   목록: https://kbl-api.sports2i.com/api/v1/players (키/몸무게/영문명)
 *   프로필: https://kbl-api.sports2i.com/api/v1/players/profile/20/{playerNo} (생년월일/학교)
 *   → 리그코드 20 = KBL
 */

import fs from "fs/promises";
import path from "path";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  Referer: "https://kbl.or.kr/",
};

const KBL_API = "https://kbl-api.sports2i.com/api/v1";
const LEAGUE_CODE = "20"; // KBL 리그코드

// ─── 1단계: 목록 API에서 키/몸무게/영문명 ───────────────────────────────────

interface KblListPlayer {
  playerNo: number;
  kname: string;
  ename: string;
  pWeight: number | null;
  pHeight: number | null;
}

async function fetchPlayerList(): Promise<Map<string, KblListPlayer>> {
  const all: KblListPlayer[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(`${KBL_API}/players?listCn=500&pageNo=${page}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = data.playerList as KblListPlayer[];
    if (list.length === 0) break;
    all.push(...list);
  }
  return new Map(all.map((p) => [String(p.playerNo), p]));
}

// ─── 2단계: 프로필 API에서 생년월일/학교 ────────────────────────────────────

interface KblProfilePlayer {
  birthday: string | null;    // "19890220"
  univSch: string | null;     // "Missouri"
  country: string | null;
}

async function fetchProfile(playerNo: string): Promise<KblProfilePlayer | null> {
  try {
    const res = await fetch(`${KBL_API}/players/profile/${LEAGUE_CODE}/${playerNo}`, {
      headers: HEADERS,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.playerInfo?.length) return null;
    return data.playerInfo[0] as KblProfilePlayer;
  } catch {
    return null;
  }
}

function parseBirthday(raw: string | null): { birthDate: string | null; birthYear: number | null } {
  if (!raw || raw.length < 8) return { birthDate: null, birthYear: null };
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  return {
    birthDate: `${y}-${m}-${d}`,
    birthYear: parseInt(y),
  };
}

// ─── 메인 ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🏀 KBL 선수 바이오 데이터 보강 시작\n");

  // 1단계: 목록 API
  console.log("── 1단계: 목록 API (키/몸무게/영문명) ──");
  const listMap = await fetchPlayerList();
  console.log(`  ${listMap.size}명 조회 완료\n`);

  // 데이터 로드
  const dataDir = process.env.KBL_DATA_DIR ?? "data/kbl";
  const filePath = path.resolve(process.cwd(), `${dataDir}/players.json`);
  const players = JSON.parse(await fs.readFile(filePath, "utf-8")) as any[];

  // 1단계 적용
  let listEnriched = 0;
  for (const p of players) {
    const kbl = listMap.get(p.pno);
    if (!kbl) continue;
    let changed = false;
    if (kbl.pHeight && !p.height) { p.height = `${kbl.pHeight}cm`; changed = true; }
    if (kbl.pWeight && !p.weight) { p.weight = `${kbl.pWeight}kg`; changed = true; }
    if (kbl.ename && !p.nameEn) { p.nameEn = kbl.ename; changed = true; }
    if (changed) listEnriched++;
  }
  console.log(`  목록 API 보강: ${listEnriched}명\n`);

  // 2단계: 프로필 API (생년월일, 학교)
  const needProfile = players.filter((p) => !p.birthDate || !p.school);
  console.log(`── 2단계: 프로필 API (생년월일/학교) — ${needProfile.length}명 ──`);

  let profileEnriched = 0;
  let profileFailed = 0;

  for (let i = 0; i < needProfile.length; i++) {
    const p = needProfile[i];
    process.stdout.write(`  [${i + 1}/${needProfile.length}] ${p.name} `);

    const info = await fetchProfile(p.pno);
    if (info) {
      let changed = false;
      if (info.birthday && !p.birthDate) {
        const { birthDate, birthYear } = parseBirthday(info.birthday);
        if (birthDate) { p.birthDate = birthDate; p.birthYear = birthYear; changed = true; }
      }
      if (info.univSch && !p.school) {
        p.school = info.univSch;
        changed = true;
      }
      if (changed) profileEnriched++;
      console.log(`✓ ${p.birthDate ?? "-"} ${p.school ?? "-"}`);
    } else {
      profileFailed++;
      console.log("✗");
    }

    await sleep(100);
  }

  // 저장
  await fs.writeFile(filePath, JSON.stringify(players, null, 2), "utf-8");

  // 최종 현황
  const count = (k: string) => players.filter((p: any) => p[k] != null && p[k] !== "").length;
  console.log(`\n✅ 보강 완료\n`);
  console.log(`  height:    ${count("height")}/${players.length}`);
  console.log(`  weight:    ${count("weight")}/${players.length}`);
  console.log(`  nameEn:    ${count("nameEn")}/${players.length}`);
  console.log(`  birthDate: ${count("birthDate")}/${players.length}`);
  console.log(`  school:    ${count("school")}/${players.length}`);
}

main().catch(console.error);
