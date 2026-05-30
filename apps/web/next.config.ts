import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  typedRoutes: true,
  reactCompiler: true,
};

export default nextConfig;
