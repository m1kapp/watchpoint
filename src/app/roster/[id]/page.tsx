import { Suspense } from "react";
import { Shell, BackHeader } from "@/components/shell";
import { RosterTab } from "@/components/tabs/roster-tab";
import { getRosterById, TEAMS } from "@/lib/data";
import { notFound } from "next/navigation";

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
