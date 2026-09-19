import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

// GET /api/subscribers — admin only
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const snap = await db.collection('subscribers').orderBy('createdAt', 'desc').get();
  return NextResponse.json(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
}

// POST /api/subscribers — public. Body: { email }
// Uses the email itself as the document ID so resubscribing is a no-op
// instead of creating duplicates.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = (body.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }

  const ref = db.collection('subscribers').doc(email);
  const existing = await ref.get();
  if (existing.exists) {
    return NextResponse.json({ id: email, ...existing.data(), alreadySubscribed: true });
  }

  const doc = { email, createdAt: new Date().toISOString() };
  await ref.set(doc);
  return NextResponse.json({ id: email, ...doc });
}
