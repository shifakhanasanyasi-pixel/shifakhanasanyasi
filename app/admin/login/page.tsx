'use client';

// Real admin login using Firebase Auth — replaces the demo's
// "any password works" screen. Wire up as app/admin/login/page.tsx.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { clientAuth } from '@/lib/firebaseClient';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(clientAuth, email, password);
      const idToken = await cred.user.getIdToken();

      // Being a valid Firebase user isn't enough — they must also have an
      // adminProfiles document, or anyone who signs up gets admin access.
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!res.ok) {
        await signOut(clientAuth);
        setError("This account doesn't have admin access.");
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch (err) {
      setError('Incorrect email or password.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      {error && <p style={{ color: '#B23A22' }}>{error}</p>}
      <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
    </form>
  );
}

// ------------------------------------------------------------
// To create your first real admin account:
// 1. Firebase Console → Authentication → Users → "Add user"
//    (set an email + password directly).
// 2. Copy that user's UID.
// 3. Firebase Console → Firestore Database → start a collection called
//    "adminProfiles" → document ID = that UID → fields: name (string),
//    role ("admin").
// Only people with a matching adminProfiles document can pass requireAdmin().
// ------------------------------------------------------------
