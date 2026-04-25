import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i-invdn-com.investing.com",
      },
      {
        protocol: "https",
        hostname: "**.marketwatch.com",
      },
      {
        protocol: "https",
        hostname: "images.mktw.net",
      },
    ],
  },
};

export default nextConfig;
