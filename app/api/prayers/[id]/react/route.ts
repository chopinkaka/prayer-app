import { NextRequest, NextResponse } from 'next/server';
import { toggleReaction } from '../../../../../lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const deviceId = (body.device_id || '').trim();
    const type = body.type;

    if (!deviceId || (type !== 'like' && type !== 'pray')) {
      return NextResponse.json(
        { success: false, error: '잘못된 요청입니다.' },
        { status: 400 }
      );
    }

    const id = parseInt(params.id, 10);
    const result = await toggleReaction(id, deviceId, type);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
