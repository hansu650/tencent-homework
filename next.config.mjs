/** @type {import('next').NextConfig} */
const legacyStoryRoutes = [
  "/briefing",
  "/profile",
  "/diagnosis",
  "/mission",
  "/mentor",
  "/hrbp"
];

const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return legacyStoryRoutes.map((source) => ({
      source,
      destination: "/",
      permanent: false
    }));
  }
};

export default nextConfig;
