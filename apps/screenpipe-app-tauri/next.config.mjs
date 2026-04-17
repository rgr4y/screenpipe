/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    eslint: {
        // Disable eslint during builds - we run it separately in CI
        ignoreDuringBuilds: true,
    },
    env: {
        // Baked at build time. Set ROB_MODE=1 before bun/next build to enable.
        NEXT_PUBLIC_ROB_MODE: process.env.ROB_MODE === '1' ? '1' : '',
    },
}
export default nextConfig;

