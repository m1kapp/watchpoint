import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { PLAYERS, TEAMS } from "@/lib/data";
import PlayerClient from "./client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const player = PLAYERS.find((p) => p.id === id);
  if (!player) return {};
  const team = TEAMS.find((t) => t.id === player.teamId);
  const tags = player.tags.slice(0, 3).join(" · ");
  const isNational = player.bio?.national_team?.is_national;
  const ogUrl = `/og?title=${encodeURIComponent(player.name)}&sub=${encodeURIComponent(`${player.position} · ${team?.name ?? ""}${isNational ? " · 🇰🇷 국가대표" : ""}`)}&color=${encodeURIComponent(team?.color ?? "#007B5F")}${tags ? `&badge=${encodeURIComponent(tags)}` : ""}`;

  return {
    title: `${player.name} · ${player.position} · ${team?.name ?? ""}`,
    description: `${player.position} · ${team?.name ?? ""}${isNational ? " · 국가대표" : ""}${tags ? ` · ${tags}` : ""}`,
    openGraph: {
      title: player.name,
      description: `${player.position} · ${team?.name ?? ""}${isNational ? " · 🇰🇷 국가대표" : ""}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
  };
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = PLAYERS.find((p) => p.id === id);
  if (!player) notFound();
  return <PlayerClient id={id} />;
}
