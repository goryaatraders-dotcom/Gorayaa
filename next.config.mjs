/** @type {import('next').NextConfig} */
const nextConfig = {
  /** Hide the Next.js Dev Tools corner logo in development */
  devIndicators: false,
  allowedDevOrigins: ['192.168.1.61', 'localhost', '127.0.0.1'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
