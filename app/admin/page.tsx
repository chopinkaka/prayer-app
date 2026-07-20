'use client';

import { useState, useEffect } from 'react';

type Prayer = {
  id: number;
  name: string;
  prayer: string;
  created_at: string;
};

export default function AdminPage() {
  const [pw, setPw] = useState('');
  const [authed, setAuthed] = useState(false);
  const [pwError, setPwError] = useState(false);
  const [data, setData] = useState<Prayer[]>([]);
  const [sortMode, setSortMode] = useState<'latest' | 'name'>('latest');
  const [loading, setLoading] = useState(false);

  async function login() {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    const result = await res.json();
    if (result.success) {
      setAuthed(true);
      setPwError(false);
      load();
    } else {
      setPwError(true);
    }
  }

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/prayers');
      const result = await res.json();
      if (result.success) setData(result.data);
    } finally {
      setLoading(false);
    }
  }

  async function del(id: number) {
    if (!confirm('이 기도제목을 삭제할까요?')) return;
    await fetch(`/api/prayers/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': pw },
    });
    load();
  }

  const sorted = [...data].sort((a, b) => {
    if (sortMode === 'name') return a.name.localeCompare(b.name, 'ko');
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const todayCount = data.filter(
    (d) => new Date(d.created_at).toDateString() === new Date().toDateString()
  ).length;

  if (!authed) {
    return (
      <div style={s.lockWrap}>
        <div style={s.lockCard}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>🔒</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#3d2b6b', marginBottom: 6 }}>
            관리자 페이지
          </h2>
          <p style={{ fontSize: 13, color: '#aaa', marginBottom: 24 }}>
            기도제목 수합 페이지입니다<br />비밀번호를 입력해주세요
          </p>
          <input
            type="password"
            style={s.pwInput}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            placeholder="비밀번호"
          />
          <button style={s.lockBtn} onClick={login}>확인</button>
          {pwError && (
            <div style={{ color: '#e53e3e', fontSize: 13, marginTop: 10 }}>
              비밀번호가 올바르지 않습니다.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={s.adminWrap}>
      <div style={s.container}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#3d2b6b' }}>
            ✝️ 중보기도 기도제목 수합
          </h1>
          <p style={{ fontSize: 13, color: '#aaa' }}>Vercel Postgres 실시간 연동</p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={s.statCard}>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#7c5cbf' }}>{data.length}</div>
            <div style={{ fontSize: 12, color: '#aaa' }}>총 기도제목</div>
          </div>
          <div style={s.statCard}>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#7c5cbf' }}>{todayCount}</div>
            <div style={{ fontSize: 12, color: '#aaa' }}>오늘 제출</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button style={s.tbtn('purple')} onClick={load}>🔄 새로고침</button>
          <button style={s.tbtn('gray')} onClick={() => setAuthed(false)}>🔓 로그아웃</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#888', fontWeight: 600 }}>정렬:</span>
          <button
            style={s.sortBtn(sortMode === 'latest')}
            onClick={() => setSortMode('latest')}
          >
            ⏱ 최신순
          </button>
          <button
            style={s.sortBtn(sortMode === 'name')}
            onClick={() => setSortMode('name')}
          >
            이름순
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#9b72d8' }}>🙏 불러오는 중...</div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#ccc' }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>🙏</div>
            <p>아직 제출된 기도제목이 없습니다</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sorted.map((item) => (
              <div key={item.id} style={s.prayerCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, color: '#3d2b6b' }}>{item.name}</span>
                  <span style={{ fontSize: 12, color: '#ccc' }}>
                    {new Date(item.created_at).toLocaleString('ko-KR')}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: '#444', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                  {item.prayer}
                </div>
                <button style={s.delBtn} onClick={() => del(item.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  lockWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', padding: 20, background: '#f7f5ff',
  } as React.CSSProperties,
  lockCard: {
    background: 'white', borderRadius: 20, padding: '44px 36px',
    width: '100%', maxWidth: 380, boxShadow: '0 8px 32px rgba(100,60,180,0.13)',
    textAlign: 'center',
  } as React.CSSProperties,
  pwInput: {
    width: '100%', border: '2px solid #e0d8f5', borderRadius: 10,
    padding: '13px 14px', fontSize: 16, outline: 'none', textAlign: 'center',
    letterSpacing: 4, boxSizing: 'border-box',
  } as React.CSSProperties,
  lockBtn: {
    width: '100%', marginTop: 14, padding: 14,
    background: 'linear-gradient(135deg, #7c5cbf, #9b72d8)', color: 'white',
    border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer',
  } as React.CSSProperties,
  adminWrap: { background: '#f7f5ff', minHeight: '100vh', padding: '24px 16px 48px' } as React.CSSProperties,
  container: { maxWidth: 700, margin: '0 auto' } as React.CSSProperties,
  statCard: {
    flex: 1, background: 'white', borderRadius: 12, padding: '16px 10px',
    textAlign: 'center', boxShadow: '0 2px 10px rgba(100,60,180,0.07)',
  } as React.CSSProperties,
  prayerCard: {
    background: 'white', borderRadius: 14, padding: '18px 52px 18px 20px',
    boxShadow: '0 2px 12px rgba(100,60,180,0.07)', borderLeft: '4px solid #9b72d8',
    position: 'relative',
  } as React.CSSProperties,
  delBtn: {
    position: 'absolute', top: 14, right: 14, background: 'none', border: 'none',
    color: '#ddd', fontSize: 18, cursor: 'pointer',
  } as React.CSSProperties,
  tbtn: (color: 'purple' | 'gray') => ({
    padding: '9px 14px', borderRadius: 9, border: 'none', fontSize: 13,
    fontWeight: 600, cursor: 'pointer',
    background: color === 'purple' ? '#7c5cbf' : '#f0f0f0',
    color: color === 'purple' ? 'white' : '#666',
  } as React.CSSProperties),
  sortBtn: (active: boolean) => ({
    padding: '6px 14px', borderRadius: 20, border: '2px solid #e0d8f5',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    background: active ? '#7c5cbf' : 'white',
    color: active ? 'white' : '#888',
    borderColor: active ? '#7c5cbf' : '#e0d8f5',
  } as React.CSSProperties),
};
