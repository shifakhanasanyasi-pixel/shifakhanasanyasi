import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

// GET /api/media — admin only. Optional ?q= filters by filename.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase();

  const snap = await db.collection('media').orderBy('uploadedAt', 'desc').get();
  let items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  if (q) items = items.filter((m: any) => m.filename?.toLowerCase().includes(q));

  return NextResponse.json(items);
}

// POST /api/media — admin only. Body: { filename, contentType, dataUrl, size }
// dataUrl is a base64 image (same approach as product photos) since the
// project has no Cloud Storage bucket set up.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { filename, contentType, dataUrl, size } = body;
  if (!filename || !dataUrl) {
    return NextResponse.json({ error: 'filename and dataUrl are required' }, { status: 400 });
  }

  const doc = {
    filename,
    contentType: contentType || 'image/jpeg',
    dataUrl,
    size: size || dataUrl.length,
    uploadedAt: new Date().toISOString(),
  };

  const ref = await db.collection('media').add(doc);
  return NextResponse.json({ id: ref.id, ...doc });
}
