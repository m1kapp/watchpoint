"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[Watchpoint:match]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-4xl font-black">경기 정보를 불러올 수 없습니다</p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        데이터가 없거나 일시적인 오류입니다.
      </p>
      <div className="flex gap-2">
        <button
          onClick={reset}
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-zinc-900"
        >
          다시 시도
        </button>
        <button
          onClick={() => router.push("/matches")}
          className="rounded-full bg-zinc-100 px-5 py-2.5 text-sm font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
        >
          경기 목록으로
        </button>
      </div>
    </div>
  );
}
