/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  redirects: async () => [
    {
      // Examples directory was hosted from https://developers.swing.xyz/examples at one time.
      // It has since been moved to https://examples.swing.xyz
      source: "/examples",
      destination: "/",
      permanent: true,
    },
  ],
};

export default nextConfig;
