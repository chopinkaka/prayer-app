import { sql } from '@vercel/postgres';

export async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS prayers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      prayer TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS reactions (
      id SERIAL PRIMARY KEY,
      prayer_id INTEGER NOT NULL REFERENCES prayers(id) ON DELETE CASCADE,
      device_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('like', 'pray')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(prayer_id, device_id, type)
    );
  `;
}

export async function listPrayers(deviceId?: string) {
  await ensureTable();
  const { rows } = await sql`
    SELECT
      p.id, p.name, p.prayer, p.created_at,
      COUNT(*) FILTER (WHERE r.type = 'like') AS like_count,
      COUNT(*) FILTER (WHERE r.type = 'pray') AS pray_count,
      BOOL_OR(r.type = 'like' AND r.device_id = ${deviceId ?? ''}) AS my_like,
      BOOL_OR(r.type = 'pray' AND r.device_id = ${deviceId ?? ''}) AS my_pray
    FROM prayers p
    LEFT JOIN reactions r ON r.prayer_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC;
  `;
  return rows;
}

export async function addPrayer(name: string, prayer: string) {
  await ensureTable();
  await sql`
    INSERT INTO prayers (name, prayer) VALUES (${name}, ${prayer});
  `;
}

export async function deletePrayer(id: number) {
  await sql`DELETE FROM prayers WHERE id = ${id};`;
}

export async function toggleReaction(prayerId: number, deviceId: string, type: 'like' | 'pray') {
  await ensureTable();
  const { rows: existing } = await sql`
    SELECT id FROM reactions WHERE prayer_id = ${prayerId} AND device_id = ${deviceId} AND type = ${type};
  `;

  if (existing.length > 0) {
    await sql`DELETE FROM reactions WHERE id = ${existing[0].id};`;
  } else {
    await sql`
      INSERT INTO reactions (prayer_id, device_id, type) VALUES (${prayerId}, ${deviceId}, ${type});
    `;
  }

  const { rows } = await sql`
    SELECT
      COUNT(*) FILTER (WHERE type = 'like') AS like_count,
      COUNT(*) FILTER (WHERE type = 'pray') AS pray_count
    FROM reactions WHERE prayer_id = ${prayerId};
  `;
  return {
    reacted: existing.length === 0,
    like_count: Number(rows[0].like_count),
    pray_count: Number(rows[0].pray_count),
  };
}
