import type { Metadata } from "next";
import localFont from "next/font/local";
import { fontFamily, THEME_SCRIPT } from "@m1kapp/ui";
import { Toaster } from "sonner";
import "./globals.css";

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

export const metadata: Metadata = {
  title: "Watchpoint — 선수 프로필",
  description: "국가대표 경력과 태그로 한눈에 보는 선수 프로필",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(){function u(){var d=document.documentElement.classList.contains('dark');var bg=d?'#111827':'#fafafa';var fg=d?'#ffffff':'#111827';var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="'+bg+'"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="900" fill="'+fg+'">WP</text></svg>';var l=document.querySelector("link[rel~='icon']")||document.createElement('link');l.rel='icon';l.href='data:image/svg+xml;base64,'+btoa(svg);if(!l.parentNode)document.head.appendChild(l);}u();new MutationObserver(u).observe(document.documentElement,{attributes:true,attributeFilter:['class']});})();` }} />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/toss/tossface/dist/tossface.css"
        />
      </head>
      <body className="min-h-full" style={{ fontFamily: fontFamily.pretendard }}>
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
