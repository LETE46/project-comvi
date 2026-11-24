import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  allowedDevOrigins: ["26.194.181.126"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "profile.line-scdn.net" },
    ],
  },
};

export default nextConfig;