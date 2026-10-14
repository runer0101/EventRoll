/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignorar errores de TypeScript en tiempo de compilación para evitar reinstalaciones automáticas.
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
