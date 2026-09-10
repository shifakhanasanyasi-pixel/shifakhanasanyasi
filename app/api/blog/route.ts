import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

// GET /api/blog — public sees only published posts; admin sees everything.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase();

  let query: FirebaseFirestore.Query = db.collection('blogPosts').orderBy('createdAt', 'desc');
  if (!admin) query = query.where('published', '==', true);

  const snapshot = await query.get();
  let posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (q) posts = posts.filter((p: any) => p.title?.toLowerCase().includes(q));

  return NextResponse.json(posts);
}

// POST /api/blog — admin only. Document ID = slug.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.title || !body.slug || !body.content) {
    return NextResponse.json({ error: 'title, slug, and content are required' }, { status: 400 });
  }

  const ref = db.collection('blogPosts').doc(body.slug);
  const existing = await ref.get();
  if (existing.exists) {
    return NextResponse.json({ error: 'A post with that slug already exists' }, { status: 409 });
  }

  const post = { ...body, published: body.published ?? false, createdAt: new Date().toISOString() };
  await ref.set(post);
  return NextResponse.json({ id: body.slug, ...post }, { status: 201 });
}
