import type { NextConfig } from "next";
import "./src/env";
const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.29.12"],
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "forensix-evidence.fly.storage.tigris.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.fly.storage.tigris.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fly.storage.tigris.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
