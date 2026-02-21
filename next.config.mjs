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
        source: "/dashbaord",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
