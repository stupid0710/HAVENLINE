import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // Allow Spline iframes and other embeds to load
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://prod.spline.design https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob: https:",
              "connect-src 'self' https://prod.spline.design https://my.spline.design wss://prod.spline.design",
              "frame-src 'self' https://my.spline.design https://prod.spline.design",
              "worker-src 'self' blob:",
              "child-src 'self' blob: https://my.spline.design",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
