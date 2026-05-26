import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... أي إعدادات أخرى لديك
  typescript: {
    // تجاهل أخطاء TypeScript أثناء البناء
    ignoreBuildErrors: true,
  },
};

export default nextConfig;