import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

// PATCH /api/reviews/[id] — admin only. Body: { status: "approved" | "rejected" }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { status } = await req.json();
  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'status must be approved or rejected' }, { status: 400 });
  }

  const { id } = await params;
  const ref = db.collection('reviews').doc(id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await ref.update({ status });

  if (status === 'approved') {
    const productId = doc.data()!.productId;
    const approvedSnap = await db.collection('reviews')
      .where('productId', '==', productId)
      .where('status', '==', 'approved')
      .get();
    const ratings = approvedSnap.docs.map((r) => r.data().rating);
    const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;

    await db.collection('products').doc(productId).update({
      rating: Math.round(avg * 10) / 10,
      reviewCount: ratings.length,
    });
  }

  return NextResponse.json({ id: ref.id, ...doc.data(), status });
}

// DELETE /api/reviews/[id] — admin only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await db.collection('reviews').doc(id).delete();
  return NextResponse.json({ success: true });
}
