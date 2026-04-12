import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.wkbl.or.kr",
      },
    ],
  },
};

export default nextConfig;
