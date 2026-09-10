import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

// GET /api/reviews — admin sees everything (?status=pending to filter);
// without admin auth, only approved reviews are returned (storefront use).
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let query: FirebaseFirestore.Query = db.collection('reviews').orderBy('createdAt', 'desc');
  query = admin
    ? (status ? query.where('status', '==', status) : query)
    : query.where('status', '==', 'approved');

  const snapshot = await query.get();
  const reviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json(reviews);
}

// POST /api/reviews — public. Starts as "pending"; only shows on the
// storefront once an admin approves it.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, name, rating, text } = body;

  if (!productId || !name || !rating || !text) {
    return NextResponse.json({ error: 'productId, name, rating, and text are required' }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'rating must be between 1 and 5' }, { status: 400 });
  }

  const productDoc = await db.collection('products').doc(productId).get();
  if (!productDoc.exists) {
    return NextResponse.json({ error: 'Unknown product' }, { status: 400 });
  }

  const ref = await db.collection('reviews').add({
    productId,
    productName: productDoc.data()!.name, // denormalized for admin list display
    name,
    rating,
    text,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  const doc = await ref.get();
  return NextResponse.json({ id: doc.id, ...doc.data() }, { status: 201 });
}
