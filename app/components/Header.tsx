'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { colors } from '../../lib/theme';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/prayers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCount(data.data.length);
      })
      .catch(() => {});
  }, []);

  const isFeed = pathname === '/feed';

  return (
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <div style={s.logo}>
        <svg viewBox="0 0 64 64" width={40} height={40}>
          <path
            d="M14 48V30C14 17 22 8 32 8C42 8 50 17 50 30V48Q50 51.5 46.5 51.5H17.5Q14 51.5 14 48Z"
            fill="white"
          />
          <rect x="28.8" y="20" width="6.4" height="23" fill="#2b2b2b" />
          <rect x="20.8" y="27.8" width="22.4" height="6.4" fill="#2b2b2b" />
        </svg>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: colors.primary, marginBottom: 2 }}>
        아둘람 청년부
      </div>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: colors.primaryDark, margin: '0 0 8px' }}>
        중보기도
      </h1>
      <p style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6, marginBottom: 18 }}>
        함께 마음을 모아 기도해요.
        <br />
        나누고 싶은 기도제목을 남겨주시면 청년부가 함께 중보합니다.
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          style={isFeed ? s.tabInactive : s.tabActive}
          onClick={() => router.push('/')}
        >
          기도제목 남기기
        </button>
        <button
          style={isFeed ? s.tabActive : s.tabInactive}
          onClick={() => router.push('/feed')}
        >
          기도 나눔{count !== null ? ` · ${count}` : ''}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    background: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px',
    boxShadow: '0 4px 14px rgba(76,175,80,0.35)',
  },
  tabActive: {
    padding: '10px 16px',
    borderRadius: 24,
    border: 'none',
    background: colors.primary,
    color: 'white',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tabInactive: {
    padding: '10px 16px',
    borderRadius: 24,
    border: `2px solid ${colors.border}`,
    background: 'white',
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};
