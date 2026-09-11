import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await db.collection('blogPosts').doc(slug).get();
  if (!doc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ id: doc.id, ...doc.data() });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const ref = db.collection('blogPosts').doc(slug);
  const existing = await ref.get();
  if (!existing.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  await ref.update(body);
  const updated = await ref.get();
  return NextResponse.json({ id: updated.id, ...updated.data() });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  await db.collection('blogPosts').doc(slug).delete();
  return NextResponse.json({ success: true });
}
