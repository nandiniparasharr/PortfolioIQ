/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // yahoo-finance2 is only loaded on the server (and only when the live
  // provider is enabled). Keep it out of the bundle so its Deno-targeted test
  // helpers are never traced by webpack; it is required at runtime instead.
  serverExternalPackages: ["yahoo-finance2"],
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
