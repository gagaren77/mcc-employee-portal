import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  // Middleware buffers request bodies (default 10MB, then truncates). Ticket uploads allow 20MB per file.
  experimental: { proxyClientMaxBodySize: "25mb" },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.okta.com" },
      { protocol: "https", hostname: "*.sharepoint.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
    ]
  },
  // Allow embedding SharePoint via iframes if needed
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ]
  },
}

export default nextConfig
