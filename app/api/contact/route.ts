import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

// GET /api/contact — admin only
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const snap = await db.collection('contactMessages').orderBy('createdAt', 'desc').get();
  return NextResponse.json(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
}

// POST /api/contact — public. Body: { name, phone, email, message }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = (body.name || '').trim();
  const phone = (body.phone || '').trim();
  const email = (body.email || '').trim();
  const message = (body.message || '').trim();

  if (!name || !phone || !message) {
    return NextResponse.json({ error: 'name, phone, and message are required' }, { status: 400 });
  }

  const doc = { name, phone, email, message, createdAt: new Date().toISOString() };
  const ref = await db.collection('contactMessages').add(doc);
  return NextResponse.json({ id: ref.id, ...doc });
}
