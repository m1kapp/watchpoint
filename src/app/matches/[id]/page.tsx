import { notFound } from "next/navigation";
import { Shell, BackHeader } from "@/components/shell";
import { MatchDetail } from "@/components/match-detail";
import { getMatchById } from "@/lib/matches";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = getMatchById(id);
  if (!match) notFound();

  const stage = match.match.stage.replace(/\s*\([^)]*\)/, "");

  return (
    <Shell headerLeft={<BackHeader label="경기 목록" href="/matches" />}>
      <MatchDetail match={match} />
    </Shell>
  );
}
