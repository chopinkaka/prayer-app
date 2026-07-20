import { NextRequest, NextResponse } from 'next/server';
import { addPrayerWithDate } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  const pw = req.headers.get('x-admin-password');
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, error: '인증 실패' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const items: { name: string; prayer: string; created_at: string }[] = body.items || [];

    for (const item of items) {
      await addPrayerWithDate(item.name, item.prayer, item.created_at);
    }

    return NextResponse.json({ success: true, count: items.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
