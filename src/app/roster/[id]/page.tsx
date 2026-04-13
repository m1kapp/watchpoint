import { Suspense } from "react";
import { type Metadata } from "next";
import { Shell, BackHeader } from "@/components/shell";
import { RosterTab } from "@/components/tabs/roster-tab";
import { getRosterById, TEAMS, PLAYERS, KBL_PLAYERS } from "@/lib/data";
import { notFound } from "next/navigation";

function resolveRoster(id: string) {
  const roster = getRosterById(id);
  if (!roster) return null;
  const team = TEAMS.find((t) => t.id === roster.teamId);
  if (!team) return null;
  const allPlayers = team.league === "KBL" ? KBL_PLAYERS : PLAYERS;
  const playerCount = allPlayers.filter((p) => p.teamId === team.id).length;
  return { teamId: roster.teamId, season: roster.season, team, playerCount };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const r = resolveRoster(id);
  if (!r) return {};
  const ogUrl = `/og?title=${encodeURIComponent(r.team.name)}&sub=${encodeURIComponent(`${r.season} 로스터 · 리그 ${r.team.rank}위 · ${r.playerCount}명`)}&color=${encodeURIComponent(r.team.color)}&badge=${encodeURIComponent("로스터")}`;

  return {
    title: `${r.team.name} · ${r.season} 로스터`,
    description: `${r.team.name} ${r.season} 시즌 로스터 · 리그 ${r.team.rank}위 · ${r.playerCount}명`,
    openGraph: {
      title: `${r.team.name} ${r.season}`,
      description: `리그 ${r.team.rank}위 · 선수 ${r.playerCount}명`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
  };
}

export default async function RosterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = resolveRoster(id);
  if (!r) notFound();

  return (
    <Shell headerLeft={<BackHeader label="팀 목록" href="/roster" />}>
      <Suspense>
        <RosterTab teamId={r.teamId} season={r.season} />
      </Suspense>
    </Shell>
  );
}
