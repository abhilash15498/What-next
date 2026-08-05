import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/whatnext-extension.zip",
        headers: [
          {
            key: "Content-Type",
            value: "application/zip",
          },
          {
            key: "Content-Disposition",
            value: 'attachment; filename="whatnext-extension.zip"',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
