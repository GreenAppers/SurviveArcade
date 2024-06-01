/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['ReplicatedStorage', 'StarterPlayer'],
  experimental: {
    serverComponentsExternalPackages: ['@rbxts/react'],
    optimizePackageImports: [ 'react' ],
  }
};

export default nextConfig;
