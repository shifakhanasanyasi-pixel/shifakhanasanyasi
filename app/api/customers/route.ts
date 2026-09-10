import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { requireAdmin } from '@/lib/requireAdmin';

// GET /api/customers — admin only. Total-spent/order-count come from the
// orders collection directly, since Firestore has no JOIN to compute this
// automatically the way a SQL view or aggregation query would.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.toLowerCase();

  const [customersSnap, ordersSnap] = await Promise.all([
    db.collection('customers').get(),
    db.collection('orders').get(),
  ]);

  const orderTotals = new Map<string, { orderCount: number; totalSpent: number }>();
  ordersSnap.docs.forEach((doc) => {
    const order = doc.data();
    const key = order.customerPhone;
    const existing = orderTotals.get(key) ?? { orderCount: 0, totalSpent: 0 };
    existing.orderCount += 1;
    existing.totalSpent += order.subtotal;
    orderTotals.set(key, existing);
  });

  let customers = customersSnap.docs.map((doc) => {
    const data = doc.data();
    const totals = orderTotals.get(doc.id) ?? { orderCount: 0, totalSpent: 0 };
    return { id: doc.id, ...data, ...totals };
  });

  if (q) customers = customers.filter((c: any) => c.name?.toLowerCase().includes(q));

  return NextResponse.json(customers);
}
