import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "www.hanafnbasketball.com",
        pathname: "/html/upload/Player/**",
      },
      {
        protocol: "http",
        hostname: "www.samsungblueminx.com",
        pathname: "/function/**",
      },
    ],
  },
};

export default nextConfig;
