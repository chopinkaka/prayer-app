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
            d="M7 50V34L11 22L20 12L32 9L44 12L53 22L57 34V50Q57 52 55 52H9Q7 52 7 50Z"
            fill="none"
            stroke="white"
            strokeWidth="3.6"
            strokeLinejoin="round"
          />
          <path
            d="M13 44V32C13 22 20 17 32 17C44 17 51 22 51 32V44Q51 48 47 48H17Q13 48 13 44Z"
            fill="white"
          />
          <rect x="30.2" y="25" width="3.6" height="30" fill="#4CAF50" />
          <rect x="25" y="30" width="14" height="3.6" fill="#4CAF50" />
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
