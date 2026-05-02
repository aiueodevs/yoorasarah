const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: blob: https:; connect-src 'self' http://localhost:4000 http://127.0.0.1:4000 https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    formats: ["image/webp"],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536],
    imageSizes: [48, 64, 80, 96, 128, 160, 256, 320],
    minimumCacheTTL: 2678400,
    qualities: [55, 65, 72, 75, 80, 82],
    remotePatterns: [
      { protocol: "https", hostname: "yoorasarah-products.fly.storage.tigris.dev" },
      { protocol: "https", hostname: "www.yoorasarah.com" },
      { protocol: "https", hostname: "image.mux.com" },
      { protocol: "https", hostname: "**.supabase.co" }
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
