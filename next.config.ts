import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@heroui/react", "@internationalized/date"],
  },
};

export default nextConfig;
