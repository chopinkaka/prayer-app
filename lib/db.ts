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
}

export async function listPrayers() {
  await ensureTable();
  const { rows } = await sql`
    SELECT id, name, prayer, created_at
    FROM prayers
    ORDER BY created_at DESC;
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
