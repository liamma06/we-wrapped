import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // This will skip ESLint during builds
  },
  typescript: {
    ignoreBuildErrors: true, // This will skip TypeScript errors during builds
  },
};

export default nextConfig;
