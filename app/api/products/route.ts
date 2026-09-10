import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

// GET /api/products — public. Supports ?category=, ?featured=true, ?q=search
//
// Note on search: Firestore has no SQL-style "contains" query, so text
// search (?q=) is done by fetching published products and filtering in
// JS. That's genuinely fine for a small catalog (tens of products) — it
// would need a dedicated search service (Algolia, Typesense) only if this
// ever grows to hundreds+ of products.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');
  const q = searchParams.get('q')?.toLowerCase();

  let query: FirebaseFirestore.Query = db.collection('products').where('published', '==', true);
  if (category) query = query.where('category', '==', category);
  if (featured === 'true') query = query.where('featured', '==', true);

  const snapshot = await query.get();
  let products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (q) {
    products = products.filter((p: any) =>
      p.name?.toLowerCase().includes(q) || p.nameUr?.includes(q) || p.category?.toLowerCase().includes(q)
    );
  }

  return NextResponse.json(products);
}

// POST /api/products — admin only. Creates a new product (document ID = slug).
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const required = ['slug', 'name', 'nameUr', 'category', 'price', 'sku'];
  const missing = required.filter((f) => !body[f]);
  if (missing.length) {
    return NextResponse.json({ error: `Missing fields: ${missing.join(', ')}` }, { status: 400 });
  }

  const ref = db.collection('products').doc(body.slug);
  const existing = await ref.get();
  if (existing.exists) {
    return NextResponse.json({ error: 'A product with that slug already exists' }, { status: 409 });
  }

  const product = {
    ...body,
    rating: body.rating ?? 0,
    reviewCount: body.reviewCount ?? 0,
    published: body.published ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await ref.set(product);
  return NextResponse.json({ id: body.slug, ...product }, { status: 201 });
}
