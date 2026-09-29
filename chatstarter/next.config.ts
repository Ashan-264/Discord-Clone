import type { NextConfig } from "next";

// NEXT_PUBLIC_CONVEX_URL is absent until `convex dev` has been run once, so parse
// it defensively — an unset value must not take down `next build`/`dev`/`lint`.
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexHostname = (() => {
  if (!convexUrl) return null;
  try {
    return new URL(convexUrl).hostname;
  } catch {
    console.warn(
      `Ignoring invalid NEXT_PUBLIC_CONVEX_URL: ${convexUrl}. Convex-hosted images will not load.`
    );
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: convexHostname
      ? [
          {
            protocol: "https",
            hostname: convexHostname,
          },
        ]
      : [],
  },
};

export default nextConfig;
