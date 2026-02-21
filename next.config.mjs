/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/Home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
