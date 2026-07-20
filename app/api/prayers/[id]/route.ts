import { NextRequest, NextResponse } from 'next/server';
import { deletePrayer } from '../../../../lib/db';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const pw = req.headers.get('x-admin-password');
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, error: '인증 실패' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id, 10);
    await deletePrayer(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
