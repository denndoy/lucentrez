import type { NextConfig } from "next";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com", ...(supabaseHostname ? [supabaseHostname] : [])],
    remotePatterns: [
      new URL("https://images.unsplash.com/**"),
      ...(supabaseHostname
        ? [new URL(`https://${supabaseHostname}/**`)]
        : []),
    ],
  },
};

export default nextConfig;
