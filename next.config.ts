import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Disable ESLint on build
  },
  // Enable the /app directory (app router)
  experimental: {
    appDir: true,
  },
};

export default nextConfig;

