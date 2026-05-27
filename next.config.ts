import type { NextConfig } from "next";
import nextTranslate from "next-translate";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
};

export default nextTranslate(nextConfig);