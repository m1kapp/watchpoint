import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.wkbl.or.kr",
      },
      {
        protocol: "https",
        hostname: "www.kbl.or.kr",
      },
      {
        protocol: "https",
        hostname: "sports-phinf.pstatic.net",
      },
      {
        protocol: "https",
        hostname: "kbl.or.kr",
      },
    ],
  },
};

export default nextConfig;
