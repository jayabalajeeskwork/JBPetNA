import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force Turbopack to use this app directory as workspace root.
  // This avoids mis-detection when parent folders also contain lockfiles.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
