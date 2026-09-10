import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// PATCH /api/orders/[id] — admin only. Body: { status: "shipped" }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { status } = await req.json();
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
  }

  const ref = db.collection('orders').doc(params.id);
  const existing = await ref.get();
  if (!existing.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await ref.update({ status });
  return NextResponse.json({ id: ref.id, ...existing.data(), status });
}
