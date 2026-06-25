import type { NextConfig } from 'next';

// const externalImageHosts = [
//   'res.cloudinary.com',
// ];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
