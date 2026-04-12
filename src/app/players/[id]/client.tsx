"use client";

import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Shell, BackHeader } from "@/components/shell";
import { PlayerDetail } from "@/components/player-detail";
import { PLAYERS } from "@/lib/data";

export default function PlayerClient({ id }: { id: string }) {
  const router = useRouter();
  const player = PLAYERS.find((p) => p.id === id);
  if (!player) notFound();

  return (
    <Shell headerLeft={<BackHeader label="뒤로" href="#" onClick={() => router.back()} />}>
      <PlayerDetail player={player} onClose={() => router.back()} />
    </Shell>
  );
}
