/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs", "@react-pdf/renderer"],
  },
};

export default nextConfig;
