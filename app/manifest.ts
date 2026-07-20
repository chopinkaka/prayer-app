import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '아둘람 청년부 중보기도',
    short_name: '중보기도',
    description: '함께 마음을 모아 기도해요',
    start_url: '/',
    display: 'standalone',
    background_color: '#F1F8F2',
    theme_color: '#4CAF50',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
