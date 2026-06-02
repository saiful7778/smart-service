import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@workspace/ui",
    "@workspace/drizzle",
    "@workspace/lib",
    "@workspace/mail",
  ],
  typedRoutes: true,
  reactCompiler: true,
};

export default nextConfig;
