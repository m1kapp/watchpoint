import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") ?? "default";

  // 공통 값
  const title  = searchParams.get("title")  ?? "Watchpoint";
  const sub    = searchParams.get("sub")    ?? "한국프로농구 관전 도우미";
  const color  = searchParams.get("color")  ?? "#007B5F";
  const home   = searchParams.get("home")   ?? "";
  const away   = searchParams.get("away")   ?? "";
  const score  = searchParams.get("score")  ?? "";
  const badge  = searchParams.get("badge")  ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0f0f0f",
          padding: "48px 56px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 accent 블러 */}
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 360, height: 360, borderRadius: "50%",
          backgroundColor: color, opacity: 0.18,
          filter: "blur(80px)",
          display: "flex",
        }} />

        {/* 로고 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: "white",
          }}>W</div>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.5px" }}>
            Watchpoint
          </span>
        </div>

        {/* 매치 타입 — home vs away */}
        {type === "match" && home && away ? (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            <div style={{ fontSize: 14, color: color, fontWeight: 700, marginBottom: 16, display: "flex" }}>
              {sub}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontSize: 44, fontWeight: 900, color: "#ffffff", letterSpacing: "-1px" }}>
                {home}
              </span>
              {score ? (
                <span style={{ fontSize: 32, fontWeight: 900, color: "#71717a", letterSpacing: "2px" }}>
                  {score}
                </span>
              ) : (
                <span style={{ fontSize: 28, fontWeight: 700, color: "#52525b" }}>vs</span>
              )}
              <span style={{ fontSize: 44, fontWeight: 900, color: "#ffffff", letterSpacing: "-1px" }}>
                {away}
              </span>
            </div>
            {badge && (
              <div style={{ display: "flex", marginTop: 20 }}>
                <div style={{
                  display: "flex",
                  backgroundColor: `${color}22`, borderRadius: 20,
                  paddingLeft: 14, paddingRight: 14, paddingTop: 6, paddingBottom: 6,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color }}>
                    {badge}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 기본 / 선수 / 로스터 */
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            {badge && (
              <div style={{
                display: "flex", marginBottom: 16,
                backgroundColor: `${color}22`, borderRadius: 20,
                paddingLeft: 14, paddingRight: 14, paddingTop: 6, paddingBottom: 6,
                width: "fit-content",
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color }}>{badge}</span>
              </div>
            )}
            <div style={{ fontSize: 52, fontWeight: 900, color: "#ffffff", letterSpacing: "-1.5px", lineHeight: 1.1, display: "flex" }}>
              {title}
            </div>
            <div style={{ fontSize: 20, color: "#71717a", marginTop: 14, fontWeight: 500, display: "flex" }}>
              {sub}
            </div>
          </div>
        )}

        {/* 하단 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color, display: "flex" }} />
          <span style={{ fontSize: 13, color: "#52525b", fontWeight: 600 }}>watchpoint.m1k.app</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
