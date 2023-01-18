/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,

  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/swap",
        permanent: false,
      },
    ];
  },
};
