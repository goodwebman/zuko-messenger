import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @zuko/* потребляются как TS-исходники → Next их транспилирует.
  transpilePackages: ['@zuko/ui', '@zuko/contracts'],
};

export default nextConfig;
