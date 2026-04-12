"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Watermark,
  AppShell,
  AppShellHeader,
  AppShellContent,
  Tab,
  TabBar,
} from "@m1kapp/ui";
import Link from "next/link";

const ACCENT = "#007B5F";

export function Shell({
  children,
  headerLeft,
  headerRight: headerRightProp,
}: {
  children: ReactNode;
  /** 헤더 왼쪽 — 기본: Watchpoint 로고 */
  headerLeft?: ReactNode;
  /** 헤더 오른쪽 추가 콘텐츠 */
  headerRight?: ReactNode;
}) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

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

  const isMatches = pathname.startsWith("/matches");
  const isRoster  = pathname.startsWith("/roster");

  const darkBtn = (
    <button
      onClick={toggleDark}
      className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );

  return (
    <Watermark color={ACCENT} speed={20} sponsor={{ name: "🏀 WKBL", url: "https://www.wkbl.or.kr/" }}>
      <AppShell className="m-0">
        <AppShellHeader>
          {headerLeft ?? (
            <Link href="/matches" className="text-base font-black tracking-tight" style={{ color: ACCENT }}>
              Watchpoint
            </Link>
          )}
          <div className="flex items-center gap-1.5">
            {headerRightProp}
            <a href="https://m1k.app/gg" target="_blank" rel="noopener noreferrer" className="flex items-center opacity-70 hover:opacity-100 transition-opacity">
              <img alt="Hits" src="https://m1k.app/badge/gg.svg" style={{ filter: isDark ? "invert(1)" : undefined }} />
            </a>
            {darkBtn}
          </div>
        </AppShellHeader>

        <AppShellContent>
          {children}
        </AppShellContent>

        <TabBar>
          <Tab
            active={isMatches}
            onClick={() => {}}
            activeColor={ACCENT}
            label="매치"
            icon={
              <Link href="/matches" className="flex items-center justify-center w-full h-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth={isMatches ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M5.5 5.5a9 9 0 0 1 13 13" />
                  <path d="M18.5 5.5a9 9 0 0 0-13 13" />
                  <line x1="12" y1="3" x2="12" y2="21" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                </svg>
              </Link>
            }
          />
          <Tab
            active={isRoster}
            onClick={() => {}}
            activeColor={ACCENT}
            label="로스터"
            icon={
              <Link href="/roster" className="flex items-center justify-center w-full h-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth={isRoster ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </Link>
            }
          />
        </TabBar>
      </AppShell>
    </Watermark>
  );
}

// 뒤로 가기 헤더 버튼
export function BackHeader({ label, href, onClick }: { label: string; href: string; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick ? (e) => { e.preventDefault(); onClick(); } : undefined}
      className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 active:text-zinc-900 transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      {label}
    </Link>
  );
}
