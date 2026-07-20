import { NextRequest, NextResponse } from 'next/server';
import { listPrayers, addPrayer } from '../../../lib/db';

export async function GET(req: NextRequest) {
  try {
    const deviceId = req.nextUrl.searchParams.get('device_id') || undefined;
    const prayers = await listPrayers(deviceId);
    return NextResponse.json({ success: true, data: prayers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim();
    const prayer = (body.prayer || '').trim();

    if (!name || !prayer) {
      return NextResponse.json(
        { success: false, error: '이름과 기도제목을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    await addPrayer(name, prayer);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
