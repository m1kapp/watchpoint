"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Watchpoint]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-4xl font-black">문제가 발생했습니다</p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        잠시 후 다시 시도해 주세요.
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-zinc-900"
      >
        다시 시도
      </button>
    </div>
  );
}
