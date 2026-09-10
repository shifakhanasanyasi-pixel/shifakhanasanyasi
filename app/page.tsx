import { db } from '@/lib/firebaseAdmin';

// Confirms the backend is deployed and Firestore is reachable. NOT the
// real storefront (that's the separate interactive HTML file) — this
// page exists purely to verify the pipeline end-to-end after deploying.
export default async function Home() {
  let products: any[] = [];
  let error: string | null = null;

  try {
    const snapshot = await db.collection('products').where('published', '==', true).get();
    products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    error = 'Could not connect to Firestore. Check your FIREBASE_* environment variables.';
  }

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '640px', margin: '0 auto' }}>
      <h1>Sanyasi Shifa Khana — Firebase Backend</h1>
      <p style={{ color: '#666' }}>
        This confirms the backend is deployed and connected to Firestore.
        The real storefront lives in the separate interactive HTML file.
      </p>

      {error ? (
        <p style={{ color: '#B23A22', fontWeight: 'bold' }}>❌ {error}</p>
      ) : products.length === 0 ? (
        <p>✅ Firestore connected, but no products found — did you run <code>npm run seed</code>?</p>
      ) : (
        <>
          <p style={{ color: '#1B6B4A', fontWeight: 'bold' }}>✅ Firestore connected. {products.length} products found:</p>
          <ul>
            {products.map((p) => (
              <li key={p.id}>{p.name} — Rs. {p.salePrice ?? p.price}</li>
            ))}
          </ul>
        </>
      )}

      <hr style={{ margin: '32px 0' }} />
      <p style={{ fontSize: '14px', color: '#999' }}>
        API endpoints: <code>/api/products</code>, <code>/api/orders</code>,{' '}
        <code>/api/reviews</code>, <code>/api/blog</code>, <code>/api/customers</code>,{' '}
        <code>/api/settings</code>
      </p>
    </main>
  );
}
