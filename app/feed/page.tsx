'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { colors } from '../../lib/theme';
import { getDeviceId } from '../../lib/deviceId';

type Prayer = {
  id: number;
  name: string;
  prayer: string;
  created_at: string;
  like_count: number | string;
  pray_count: number | string;
  my_like: boolean | null;
  my_pray: boolean | null;
};

export default function FeedPage() {
  const [data, setData] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthKey, setMonthKey] = useState('all');
  const [sortMode, setSortMode] = useState<'latest' | 'name'>('latest');
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    setDeviceId(getDeviceId());
  }, []);

  async function load(id?: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/prayers?device_id=${encodeURIComponent(id ?? deviceId)}`);
      const result = await res.json();
      if (result.success) setData(result.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (deviceId) load(deviceId);
  }, [deviceId]);

  const months = useMemo(() => {
    const map = new Map<string, { label: string; sortKey: number }>();
    data.forEach((p) => {
      const d = new Date(p.created_at);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      map.set(key, { label: `${d.getMonth() + 1}월`, sortKey: d.getFullYear() * 100 + d.getMonth() });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1].sortKey - a[1].sortKey)
      .map(([key, v]) => ({ key, label: v.label }));
  }, [data]);

  const filtered = useMemo(() => {
    if (monthKey === 'all') return data;
    return data.filter((p) => {
      const d = new Date(p.created_at);
      return `${d.getFullYear()}-${d.getMonth() + 1}` === monthKey;
    });
  }, [data, monthKey]);

  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [filtered]);

  const grouped = useMemo(() => {
    const map = new Map<string, Prayer[]>();
    sorted.forEach((p) => {
      if (!map.has(p.name)) map.set(p.name, []);
      map.get(p.name)!.push(p);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], 'ko'));
  }, [sorted]);

  async function react(id: number, type: 'like' | 'pray') {
    if (!deviceId) return;
    const key = type === 'like' ? 'like_count' : 'pray_count';
    const myKey = type === 'like' ? 'my_like' : 'my_pray';

    setData((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const wasReacted = !!p[myKey];
        return {
          ...p,
          [myKey]: !wasReacted,
          [key]: Number(p[key]) + (wasReacted ? -1 : 1),
        };
      })
    );

    try {
      const res = await fetch(`/api/prayers/${id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId, type }),
      });
      const result = await res.json();
      if (result.success) {
        setData((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  like_count: result.like_count,
                  pray_count: result.pray_count,
                  [myKey]: result.reacted,
                }
              : p
          )
        );
      }
    } catch (e) {
      load();
    }
  }

  const monthLabel = monthKey === 'all' ? '전체' : months.find((m) => m.key === monthKey)?.label ?? '';

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <Header />

        <div style={styles.chipRow}>
          <button
            style={monthKey === 'all' ? styles.chipActive : styles.chip}
            onClick={() => setMonthKey('all')}
          >
            전체
          </button>
          {months.map((m) => (
            <button
              key={m.key}
              style={monthKey === m.key ? styles.chipActive : styles.chip}
              onClick={() => setMonthKey(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div style={styles.chipRow}>
          <button
            style={sortMode === 'latest' ? styles.sortActive : styles.sort}
            onClick={() => setSortMode('latest')}
          >
            최신순
          </button>
          <button
            style={sortMode === 'name' ? styles.sortActive : styles.sort}
            onClick={() => setSortMode('name')}
          >
            이름별
          </button>
        </div>

        <div style={styles.toolbar}>
          <span style={{ fontSize: 13, color: colors.textMuted, fontWeight: 600 }}>
            {monthLabel} 기도제목 {filtered.length}개
          </span>
          <button style={styles.refreshBtn} onClick={() => load()}>
            새로고침
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: colors.primary }}>
            🙏 불러오는 중...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#ccc' }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>🙏</div>
            <p>아직 기도제목이 없습니다</p>
          </div>
        ) : sortMode === 'latest' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sorted.map((p) => (
              <div key={p.id} style={styles.card2}>
                <div style={styles.itemHeader}>
                  <span style={{ fontWeight: 700, color: colors.primaryDark }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: '#bbb' }}>
                    {new Date(p.created_at).toLocaleDateString('ko-KR', {
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <PrayerBody p={p} />
                <ReactionRow p={p} onReact={react} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {grouped.map(([name, items]) => (
              <div key={name} style={styles.card2}>
                <div style={styles.itemHeader}>
                  <span style={{ fontWeight: 700, color: colors.primaryDark }}>{name}</span>
                  <span style={styles.badge}>{items.length}</span>
                </div>
                {items.map((p, i) => (
                  <div key={p.id} style={i > 0 ? styles.divider : undefined}>
                    <div style={{ fontSize: 12, color: '#bbb', marginBottom: 4 }}>
                      {new Date(p.created_at).toLocaleDateString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <PrayerBody p={p} />
                    <ReactionRow p={p} onReact={react} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PrayerBody({ p }: { p: Prayer }) {
  return (
    <div style={{ fontSize: 14, color: '#444', lineHeight: 1.75, whiteSpace: 'pre-wrap', marginBottom: 10 }}>
      {p.prayer}
    </div>
  );
}

function ReactionRow({
  p,
  onReact,
}: {
  p: Prayer;
  onReact: (id: number, type: 'like' | 'pray') => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        style={p.my_like ? styles.reactBtnActive : styles.reactBtn}
        onClick={() => onReact(p.id, 'like')}
      >
        ❤️ {Number(p.like_count)}
      </button>
      <button
        style={p.my_pray ? styles.reactBtnActive : styles.reactBtn}
        onClick={() => onReact(p.id, 'pray')}
      >
        🙏 {Number(p.pray_count)}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    background: colors.bg,
    minHeight: '100vh',
    padding: '30px 16px 48px',
  },
  card: { maxWidth: 480, margin: '0 auto' },
  chipRow: { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  chip: {
    padding: '6px 14px',
    borderRadius: 20,
    border: `2px solid ${colors.border}`,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    background: 'white',
    color: colors.textMuted,
  },
  chipActive: {
    padding: '6px 14px',
    borderRadius: 20,
    border: `2px solid ${colors.primary}`,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    background: colors.primary,
    color: 'white',
  },
  sort: {
    padding: '6px 14px',
    borderRadius: 20,
    border: '2px solid #e5e5e5',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    background: 'white',
    color: '#888',
  },
  sortActive: {
    padding: '6px 14px',
    borderRadius: 20,
    border: '2px solid #333',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    background: '#333',
    color: 'white',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshBtn: {
    padding: '6px 14px',
    borderRadius: 20,
    border: 'none',
    background: colors.primaryLight,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  card2: {
    background: 'white',
    borderRadius: 14,
    padding: '18px 20px',
    boxShadow: '0 2px 12px rgba(46,125,50,0.07)',
    borderLeft: `4px solid ${colors.primary}`,
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    background: colors.primaryLight,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 10,
    padding: '2px 9px',
  },
  divider: {
    borderTop: `1px solid ${colors.border}`,
    marginTop: 14,
    paddingTop: 14,
  },
  reactBtn: {
    padding: '5px 12px',
    borderRadius: 16,
    border: '1px solid #eee',
    background: '#fafafa',
    fontSize: 12,
    fontWeight: 600,
    color: '#888',
    cursor: 'pointer',
  },
  reactBtnActive: {
    padding: '5px 12px',
    borderRadius: 16,
    border: `1px solid ${colors.primary}`,
    background: colors.primaryLight,
    fontSize: 12,
    fontWeight: 700,
    color: colors.primaryDark,
    cursor: 'pointer',
  },
};
