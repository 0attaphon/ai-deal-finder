import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Allow Chrome extension to call API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
          // Origin is validated per-request in each route handler
          // (allows chrome-extension:// origins dynamically)
        ],
      },
    ];
  },
};

export default nextConfig;
