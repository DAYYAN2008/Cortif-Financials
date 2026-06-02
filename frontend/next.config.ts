import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
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
