import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

// DELETE /api/media/[id] — admin only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await db.collection('media').doc(id).delete();
  return NextResponse.json({ success: true });
}
