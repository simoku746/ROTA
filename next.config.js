/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Uygulamanın kendisi public/rota.html'dir; kök adres doğrudan onu açar.
    return {
      beforeFiles: [{ source: '/', destination: '/rota.html' }],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        // Yeni yayın sonrası tarayıcı eski sürümü kullanmasın.
        source: '/rota.html',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ];
  },
};

module.exports = nextConfig;
