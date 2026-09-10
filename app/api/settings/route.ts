import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

const DEFAULTS = {
  siteName: 'Sanyasi Shifa Khana',
  whatsapp: '923000000000',
  email: 'hello@sanyasishifakhana.com',
  phone: '+92 300 0000000',
  instagram: '',
  facebook: '',
};

// GET /api/settings — public. The storefront needs this for WhatsApp
// links, contact info, etc. Nothing sensitive lives here.
export async function GET() {
  const ref = db.collection('settings').doc('site');
  const doc = await ref.get();
  if (!doc.exists) {
    await ref.set(DEFAULTS);
    return NextResponse.json(DEFAULTS);
  }
  return NextResponse.json(doc.data());
}

// PUT /api/settings — admin only
export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const update = {
    siteName: body.siteName,
    whatsapp: body.whatsapp?.replace(/[^0-9]/g, ''), // digits only, matches wa.me format
    email: body.email,
    phone: body.phone,
    instagram: body.instagram,
    facebook: body.facebook,
  };

  const ref = db.collection('settings').doc('site');
  await ref.set(update, { merge: true });
  const updated = await ref.get();
  return NextResponse.json(updated.data());
}
