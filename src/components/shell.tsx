"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
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

function ShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("링크 복사됨");
    setTimeout(() => { setCopied(false); setOpen(false); }, 1500);
  }

  async function handleShare() {
    setOpen(false);
    try { await navigator.share({ url: window.location.href }); } catch {}
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
        aria-label="공유"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-6 px-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-5 pb-2">
              <p className="text-sm font-black text-zinc-900 dark:text-white">공유하기</p>
              <p className="text-[11px] text-zinc-400 mt-0.5 break-all">{typeof window !== "undefined" ? window.location.href : ""}</p>
            </div>
            <div className="p-3 flex flex-col gap-1">
              <button
                onClick={handleCopy}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <span className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  {copied ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </span>
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{copied ? "복사됨!" : "링크 복사"}</span>
              </button>

              {canShare && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
                >
                  <span className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </span>
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">더 보내기</span>
                </button>
              )}
            </div>
            <div className="px-3 pb-3">
              <button
                onClick={() => setOpen(false)}
                className="w-full py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-bold text-zinc-500 dark:text-zinc-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}

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
              <img alt="Hits" src="https://m1k.app/badge/gg.svg" referrerPolicy="unsafe-url" style={{ filter: isDark ? "invert(1)" : undefined }} />
            </a>
            <ShareButton />
            <span className="hidden">{darkBtn}</span>
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
