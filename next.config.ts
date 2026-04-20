import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "static-pubcomm.onstove.com" },
      { protocol: "https", hostname: "fribbels.github.io" },
    ],
  },
};

export default nextConfig;
