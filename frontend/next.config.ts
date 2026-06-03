import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "../"),
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
