import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lets a second dev server run side-by-side (NEXT_DIST_DIR=.next-alt)
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
    qualities: [60, 75, 90],
  },
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
