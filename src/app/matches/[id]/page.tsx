import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell, BackHeader } from "@/components/shell";
import { MatchDetail } from "@/components/match-detail";
import { getMatchById } from "@/lib/matches";
import { getTeamColor } from "@/lib/team-styles";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const match = getMatchById(id);
  if (!match) return {};

  const { home, away, stage, date, score } = match.match;
  const color = getTeamColor(home).bg;
  const stageLabel = stage.replace(/\s*\([^)]*\)/, "");
  const scoreStr = score ? `${score.home}:${score.away}` : "";
  const wpCount = [
    ...(match.coaches ?? []).filter((c) => c.watch_point),
    ...match.players.filter((p) => p.featured && p.watch_point),
  ].length;
  const ogUrl = `/og?type=match&home=${encodeURIComponent(home)}&away=${encodeURIComponent(away)}&sub=${encodeURIComponent(stageLabel)}&color=${encodeURIComponent(color)}${scoreStr ? `&score=${scoreStr}` : ""}${wpCount ? `&badge=관전포인트 ${wpCount}개` : ""}`;

  return {
    title: `${home} vs ${away} · ${stageLabel}`,
    description: `${date} · ${stageLabel}${wpCount ? ` · 관전포인트 ${wpCount}개` : ""}`,
    openGraph: {
      title: `${home} vs ${away}`,
      description: `${stageLabel} · ${date}${wpCount ? ` · 관전포인트 ${wpCount}개` : ""}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
  };
}

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = getMatchById(id);
  if (!match) notFound();

  return (
    <Shell headerLeft={<BackHeader label="경기 목록" href="/matches" />}>
      <MatchDetail match={match} />
    </Shell>
  );
}
