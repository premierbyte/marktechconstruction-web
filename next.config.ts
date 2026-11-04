import type { NextConfig } from "next";

function normaliseMediaPath(value: string | undefined): string | null {
  const configured = (value ?? "/storage").trim() || "/storage";

  if (!configured.startsWith("/")) return null;

  const path = configured.replace(/\/+$/, "");

  return path === "" ? null : path;
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    const apiOrigin = process.env.INTERNAL_API_URL ?? "http://127.0.0.1:8000";
    const mediaPath = normaliseMediaPath(process.env.MEDIA_PUBLIC_URL);

    const rewrites = [
      { source: "/api/v1/:path*", destination: `${apiOrigin}/api/v1/:path*` },
      { source: "/sanctum/:path*", destination: `${apiOrigin}/sanctum/:path*` },
    ];

    if (mediaPath !== null) {
      rewrites.push({
        source: `${mediaPath}/:path*`,
        destination: `${apiOrigin}${mediaPath}/:path*`,
      });
    }

    return rewrites;
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
