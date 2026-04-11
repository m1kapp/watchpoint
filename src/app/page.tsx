"use client";

import { useState, useEffect } from "react";
import {
  Watermark,
  AppShell,
  AppShellHeader,
  AppShellContent,
  Tab,
  TabBar,
} from "@m1kapp/ui";
import { ExploreTab } from "@/components/tabs/explore-tab";
import { RosterTab } from "@/components/tabs/roster-tab";

const HANA_GREEN = "#008485";

type TabKey = "explore" | "players";

export default function Home() {
  const [tab, setTab] = useState<TabKey>("explore");
  const [rosterTeamId, setRosterTeamId] = useState<string | undefined>(undefined);
  const [isDark, setIsDark] = useState(false);

  function viewRoster(teamId: string) {
    setRosterTeamId(teamId);
    setTab("players");
  }

  function handleTabChange(t: TabKey) {
    setTab(t);
    if (t !== "players") setRosterTeamId(undefined);
  }

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleDark() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      document.cookie = `theme=${next ? "dark" : "light"};path=/;max-age=31536000;SameSite=Lax`;
    } catch {}
  }

  return (
    <Watermark
      color={HANA_GREEN}
      sponsor={{ name: "하나은행 여자농구단", url: "http://www.hanafnbasketball.com/" }}
    >
      <AppShell className="m-0">
        <AppShellHeader>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black tracking-tight" style={{ color: HANA_GREEN }}>
              👁 Watchpoint
            </span>
          </div>
          <button
            onClick={toggleDark}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {isDark ? (
              // 해 아이콘
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              // 달 아이콘
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </AppShellHeader>

        <AppShellContent>
          {tab === "explore"
            ? <ExploreTab onViewRoster={viewRoster} />
            : <RosterTab initialTeamId={rosterTeamId} />
          }
        </AppShellContent>

        <TabBar>
          <Tab
            active={tab === "explore"}
            onClick={() => handleTabChange("explore")}
            activeColor={HANA_GREEN}
            label="탐색"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={tab === "explore" ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            }
          />
          <Tab
            active={tab === "players"}
            onClick={() => handleTabChange("players")}
            activeColor={HANA_GREEN}
            label="로스터"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={tab === "players" ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            }
          />
        </TabBar>
      </AppShell>
    </Watermark>
  );
}
