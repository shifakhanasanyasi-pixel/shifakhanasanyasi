import { NextRequest } from 'next/server';
import { adminAuth, db } from './firebaseAdmin';

/**
 * Verifies the request carries a valid Firebase ID token AND that user has
 * an adminProfiles document (i.e. is actually allowed into the admin panel,
 * not just anyone with a Firebase account). Returns null if either check
 * fails — every protected route does: `if (!admin) return 401`.
 *
 * The frontend sends the token as: Authorization: Bearer <idToken>
 * (obtained client-side via `await clientAuth.currentUser.getIdToken()`)
 */
export async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const idToken = authHeader.slice('Bearer '.length);

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const profileDoc = await db.collection('adminProfiles').doc(decoded.uid).get();
    if (!profileDoc.exists) return null; // valid Firebase user, but not an admin

    return { uid: decoded.uid, email: decoded.email, profile: profileDoc.data() };
  } catch {
    return null; // expired/invalid token
  }
}
