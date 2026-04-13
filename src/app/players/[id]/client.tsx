"use client";

import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Shell, BackHeader } from "@/components/shell";
import { PlayerDetail } from "@/components/player-detail";
import { PLAYERS, KBL_PLAYERS } from "@/lib/data";

const ALL_PLAYERS = [...PLAYERS, ...KBL_PLAYERS];

export default function PlayerClient({ id }: { id: string }) {
  const router = useRouter();
  const player = ALL_PLAYERS.find((p) => p.id === id);
  if (!player) notFound();

  return (
    <Shell headerLeft={<BackHeader label="뒤로" href="#" onClick={() => router.back()} />}>
      <PlayerDetail player={player} onClose={() => router.back()} />
    </Shell>
  );
}
