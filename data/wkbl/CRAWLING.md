# 데이터 수집 가이드 (Claude Code용)

## JSON이 하나도 없을 때 가장 빠른 순서

1. `npm run scrape:teams` — 팀 메타 (5초)
2. `npm run scrape:scores` — 시즌 전체 결과 (30초)
3. `npm run scrape:matches` — 플레이오프 일정 (30초)
4. `npm run scrape:players` — 선수 로스터 (10분, 백그라운드)
5. Claude Code 웹서치 — `national-team.json`, `awards.json`, `national-tournaments.json`

---

크롤링 스크립트가 `scripts/scrape/wkbl/`에 구현되어 있습니다.
Claude Code는 스크립트를 직접 실행하면 됩니다.

---

## 빠른 실행 (Claude Code 지시 방법)

### 스코어 업데이트 (경기 당일 or 다음날)
```
npm run scrape:scores
```
→ 네이버 스포츠 API에서 시즌 전체 결과를 받아 `data/wkbl/scores.json` 갱신

### 플레이오프 일정 업데이트
```
npm run scrape:matches
```
→ WKBL 공식 페이지 파싱, `data/wkbl/matches.json` 갱신

### 선수 데이터 업데이트 (시즌 초 · 트레이드 후)
```
npm run scrape:players
```
→ WKBL 선수 페이지 전수 크롤링 (느림), `data/wkbl/players.json` 갱신

### 전체 한 번에
```
npm run scrape
```

---

## 스크립트 위치 및 소스

| 스크립트 | 파일 | 소스 URL |
|----------|------|----------|
| `scrape:teams`   | `scripts/scrape/wkbl/teams.ts`   | `wkbl.or.kr/player/player_list.asp` (팀 드롭다운) + `api-gw.sports.naver.com` (naverName) |
| `scrape:scores`  | `scripts/scrape/wkbl/scores.ts`  | `api-gw.sports.naver.com/schedule/games` (JSON API) |
| `scrape:matches` | `scripts/scrape/wkbl/matches.ts` | `wkbl.or.kr/event/playoff2526/` (HTML 파싱) |
| `scrape:players` | `scripts/scrape/wkbl/players.ts` | `wkbl.or.kr/player/player_list.asp` (HTML 파싱) |

공통 상수 (URL 헬퍼, 시즌 코드 등): `scripts/scrape/wkbl/constants.ts`

---

## 스크립트로 안 되는 것들 (Claude Code 웹서치)

스크립트가 없는 데이터는 Claude Code가 직접 웹서치해서 찾아 JSON을 갱신합니다.

### 국가대표 명단 (`data/wkbl/national-team.json`)
```
여자농구 국가대표 최신 명단 웹서치해서
data/wkbl/national-team.json roster 갱신해줘.
필드: name, pno(WKBL 선수등록번호), level(A대표팀/국가대표 후보), wkblTeamId, captain
```

### MVP · 신인왕 (`data/wkbl/awards.json`)
```
이번 시즌 WKBL MVP/신인왕 웹서치해서
data/wkbl/awards.json 갱신해줘.
key 형식: "이름:pno"
```

---

## 데이터 파일

```
data/wkbl/
├── teams.json                 # 팀 메타 (tcode, teamId, nameEn 등)
├── matches.json               # 플레이오프 경기 일정 + 스코어
├── players.json               # 선수 로스터 + 시즌 스탯
├── scores.json                # 시즌 전체 경기 결과
├── national-team.json         # 국가대표 명단
├── national-tournaments.json  # 대표팀 국제대회 이력
└── awards.json                # MVP · 신인왕 (시즌별)
```

---

## 시즌 전환 시

`scripts/scrape/wkbl/constants.ts` 의 두 값만 수정:

```ts
export const CURRENT_SEASON_GU = "047";  // 046 → 047
```

그리고 `WKBL_URLS.playoff()`의 URL 연도도 함께 수정:
```ts
playoff: () => `${WKBL_BASE}/event/playoff2627/`,
```
