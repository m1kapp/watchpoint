import { Suspense } from "react";
import { type Metadata } from "next";
import { Shell, BackHeader } from "@/components/shell";
import { RosterTab } from "@/components/tabs/roster-tab";
import { getRosterById, TEAMS, PLAYERS } from "@/lib/data";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const roster = getRosterById(id);
  if (!roster) return {};
  const team = TEAMS.find((t) => t.id === roster.teamId);
  if (!team) return {};
  const playerCount = PLAYERS.filter((p) => p.teamId === team.id).length;
  const ogUrl = `/og?title=${encodeURIComponent(team.name)}&sub=${encodeURIComponent(`${roster.season} 로스터 · 리그 ${team.rank}위 · ${playerCount}명`)}&color=${encodeURIComponent(team.color)}&badge=${encodeURIComponent("로스터")}`;

  return {
    title: `${team.name} · ${roster.season} 로스터`,
    description: `${team.name} ${roster.season} 시즌 로스터 · 리그 ${team.rank}위 · ${playerCount}명`,
    openGraph: {
      title: `${team.name} ${roster.season}`,
      description: `리그 ${team.rank}위 · 선수 ${playerCount}명`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
  };
}

export default async function RosterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const roster = getRosterById(id);
  if (!roster) notFound();

  const team = TEAMS.find((t) => t.id === roster.teamId);
  if (!team) notFound();

  return (
    <Shell headerLeft={<BackHeader label="팀 목록" href="/roster" />}>
      <Suspense>
        <RosterTab teamId={roster.teamId} season={roster.season} />
      </Suspense>
    </Shell>
  );
}
