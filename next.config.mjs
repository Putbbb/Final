import 'dotenv/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEONDB_URL: process.env.NEONDB_URL,
  },
};

export default nextConfig;
