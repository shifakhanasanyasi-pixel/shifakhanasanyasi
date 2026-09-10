import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Server-side only — uses the service account key, which has full admin
// access to your Firebase project. This file must never be imported into
// any client component; it only runs inside API routes / server code.
let app: App;

if (!getApps().length) {
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Private keys from env vars usually have literal "\n" that need
      // converting back to real newlines — see .env.example for the exact
      // format this expects.
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const adminAuth = getAuth(app);
