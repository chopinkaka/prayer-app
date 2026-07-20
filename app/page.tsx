'use client';

import { useState } from 'react';
import Header from './components/Header';
import { colors } from '../lib/theme';

export default function Home() {
  const [name, setName] = useState('');
  const [prayer, setPrayer] = useState('');
  const [errName, setErrName] = useState(false);
  const [errPrayer, setErrPrayer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    const n = name.trim();
    const p = prayer.trim();
    setErrName(!n);
    setErrPrayer(!p);
    if (!n || !p) return;

    setLoading(true);
    try {
      const res = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n, prayer: p }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
      } else {
        alert(data.error || '제출 중 오류가 발생했습니다.');
      }
    } catch (e) {
      alert('제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setName('');
    setPrayer('');
    setDone(false);
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <Header />

        {!done ? (
          <>
            <label style={styles.label}>이름</label>
            <input
              style={styles.input}
              value={name}
              maxLength={20}
              placeholder="성함 · 익명도 괜찮아요"
              onChange={(e) => setName(e.target.value)}
            />
            {errName && <div style={styles.error}>이름을 입력해주세요.</div>}

            <label style={styles.label}>기도제목</label>
            <textarea
              style={{ ...styles.input, height: 150, resize: 'none' }}
              value={prayer}
              maxLength={500}
              placeholder="나누고 싶은 기도제목을 자유롭게 적어주세요"
              onChange={(e) => setPrayer(e.target.value)}
            />
            <div style={{ textAlign: 'right', fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
              {prayer.length} / 500
            </div>
            {errPrayer && <div style={styles.error}>기도제목을 입력해주세요.</div>}

            <button style={styles.btn} disabled={loading} onClick={submit}>
              {loading ? '제출 중...' : '기도제목 제출하기 🙏'}
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 54, marginBottom: 14 }}>🙏</div>
            <h2 style={{ fontSize: 20, color: colors.primaryDark, marginBottom: 8 }}>
              기도제목이 전달되었습니다
            </h2>
            <p style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.7 }}>
              소중한 기도제목을 나눠주셔서 감사합니다.
              <br />
              함께 중보기도 드리겠습니다.
            </p>
            <button style={styles.againBtn} onClick={reset}>
              기도제목 추가 제출하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    background: colors.bg,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    background: 'white',
    borderRadius: 20,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 480,
    boxShadow: '0 8px 32px rgba(46,125,50,0.10)',
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: colors.primaryDark,
    marginBottom: 6,
    marginTop: 20,
  },
  input: {
    width: '100%',
    border: `2px solid ${colors.border}`,
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 15,
    fontFamily: 'inherit',
    color: '#333',
    outline: 'none',
    boxSizing: 'border-box',
  },
  error: { color: '#e53e3e', fontSize: 12, marginTop: 5 },
  btn: {
    width: '100%',
    marginTop: 28,
    padding: 15,
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
    color: 'white',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
  },
  againBtn: {
    marginTop: 22,
    width: '100%',
    padding: 12,
    background: 'transparent',
    border: `2px solid ${colors.primary}`,
    color: colors.primaryDark,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
};
