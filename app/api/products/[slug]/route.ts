import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

// GET /api/products/[slug] — public. Document ID === slug.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await db.collection('products').doc(slug).get();
  if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const reviewsSnap = await db.collection('reviews')
    .where('productId', '==', slug)
    .where('status', '==', 'approved')
    .get();

  return NextResponse.json({
    id: doc.id,
    ...doc.data(),
    reviews: reviewsSnap.docs.map((r) => ({ id: r.id, ...r.data() })),
  });
}

// PUT /api/products/[slug] — admin only
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const ref = db.collection('products').doc(slug);
  const existing = await ref.get();
  if (!existing.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  await ref.update({ ...body, updatedAt: new Date().toISOString() });
  const updated = await ref.get();
  return NextResponse.json({ id: updated.id, ...updated.data() });
}

// DELETE /api/products/[slug] — admin only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const ref = db.collection('products').doc(slug);
  const existing = await ref.get();
  if (!existing.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await ref.delete();
  return NextResponse.json({ success: true });
}
