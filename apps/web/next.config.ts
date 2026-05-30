import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/drizzle"],
  typedRoutes: true,
  reactCompiler: true,
};

export default nextConfig;
