import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

// GET /api/orders — admin only. Supports ?status=, ?q=
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const q = searchParams.get('q')?.toLowerCase();

  let query: FirebaseFirestore.Query = db.collection('orders').orderBy('createdAt', 'desc');
  if (status) query = query.where('status', '==', status);

  const snapshot = await query.get();
  let orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (q) {
    orders = orders.filter((o: any) =>
      o.orderNumber?.toLowerCase().includes(q) || o.customerName?.toLowerCase().includes(q)
    );
  }

  return NextResponse.json(orders);
}

// POST /api/orders — public. Called by the cart's checkout button.
// Body: { customerName, customerPhone, customerEmail?, items: [{ productId, quantity }] }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerName, customerPhone, customerEmail, items } = body;

  if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'customerName, customerPhone, and at least one item are required' }, { status: 400 });
  }

  // Look up real prices server-side from Firestore — never trust a price
  // the client sends, since that's trivially editable before the request
  // is sent. Firestore has no multi-document JOIN, so we fetch each
  // product doc individually (fine at this scale — a handful of items).
  const productDocs = await Promise.all(
    items.map((i: any) => db.collection('products').doc(i.productId).get())
  );

  const orderItems = [];
  for (let i = 0; i < items.length; i++) {
    const doc = productDocs[i];
    if (!doc.exists) {
      return NextResponse.json({ error: `Unknown product: ${items[i].productId}` }, { status: 400 });
    }
    const product = doc.data()!;
    orderItems.push({
      productId: doc.id,
      name: product.name,     // embedded/denormalized — Firestore has no
      nameUr: product.nameUr, // joins, so we snapshot what we need here
      quantity: items[i].quantity,
      unitPrice: product.salePrice ?? product.price,
    });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  // Firestore has no auto-increment, so a running counter document +
  // transaction gives us safe, gap-free-ish sequential order numbers even
  // if two orders come in at the same moment.
  const counterRef = db.collection('counters').doc('orders');
  const orderNumber = await db.runTransaction(async (tx) => {
    const counterDoc = await tx.get(counterRef);
    const next = (counterDoc.data()?.value ?? 1041) + 1;
    tx.set(counterRef, { value: next }, { merge: true });
    return `SSK-${next}`;
  });

  // Upsert the customer by phone number (Firestore doc ID = phone, since
  // Firestore doesn't have SQL-style unique constraints on arbitrary fields).
  const customerRef = db.collection('customers').doc(customerPhone);
  await customerRef.set(
    { name: customerName, phone: customerPhone, email: customerEmail ?? null },
    { merge: true }
  );

  const orderRef = db.collection('orders').doc();
  const order = {
    orderNumber,
    customerName,
    customerPhone,
    items: orderItems,
    subtotal,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await orderRef.set(order);

  return NextResponse.json({ id: orderRef.id, ...order }, { status: 201 });
}
