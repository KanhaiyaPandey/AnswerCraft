/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@answer-craft/ui",
    "@answer-craft/lib",
    "@answer-craft/types",
  ],
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

module.exports = nextConfig;
