# Sanyasi Shifa Khana — Firebase Backend (Firestore + Auth), hosted on Vercel

This uses Google Firebase for **data** (Firestore) and **authentication**
(real admin login, replacing the demo's "any password works" screen), but
runs on **Vercel** for hosting instead of Firebase App Hosting — this
avoids needing to enable Firebase's paid Blaze plan / add a payment method
at all. Firestore and Firebase Authentication are free (Spark plan); only
Firebase's own App Hosting specifically requires Blaze, so hosting
elsewhere sidesteps that completely.

**Important — this code has not been run.** I have no network access or a
live Firebase project in my environment, so none of this has been tested
end-to-end. It follows correct, standard Firebase Admin SDK and Next.js
patterns, but budget time to actually run it and debug against a real
project — normal for any backend before it's trusted with real orders.

## Why this is a genuine rewrite, not a config swap

Firestore is a NoSQL document database — very different from Postgres.
There are no tables, no JOINs, no relational schema. Every API route here
was rewritten around Firestore's actual model: collections of documents,
data embedded/denormalized where a SQL version would have used a JOIN
(e.g. an order stores each item's product name and price directly, rather
than looking it up from a separate table every time).

## Setup, start to finish

### 1. Create the Firebase project
- Go to console.firebase.google.com → **Add project**
- Leave Google Analytics off unless you want it
- This stays on the free **Spark** plan — nothing here needs Blaze

### 2. Enable Firestore
- **Build → Firestore Database → Create database**
- Choose a region close to your customers (e.g. `asia-south1` for Pakistan)
- Start in **production mode** (the security rules in this project handle access control)

### 3. Enable Authentication
- **Build → Authentication → Get started**
- Under "Sign-in method," enable **Email/Password**

### 4. Register a Web App (for the client-side config)
- Project Settings (gear icon) → scroll to "Your apps" → click the **Web** icon (`</>`)
- Give it any nickname, register it
- Copy the `firebaseConfig` values shown — these go in your `.env` as the `NEXT_PUBLIC_FIREBASE_*` variables

### 5. Generate a service account key (for the Admin SDK)
- Project Settings → **Service Accounts** tab → **Generate new private key**
- Downloads a JSON file — copy three values from it into your `.env`:
  `project_id` → `FIREBASE_PROJECT_ID`, `client_email` → `FIREBASE_CLIENT_EMAIL`,
  `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` characters exactly as-is)
- Copy `.env.example` to `.env` and fill in all of the above

### 6. Install the Firebase CLI and project dependencies
```bash
npm install -g firebase-tools
firebase login
npm install
```

### 7. Connect this folder to your Firebase project
```bash
firebase use --add
```
Pick the project you created, give it the alias `default` when prompted.

### 8. Deploy the Firestore security rules
```bash
npm run rules:deploy
```
This step still uses the Firebase CLI regardless of where you host the
app — security rules are a Firestore feature, unrelated to hosting.

### 9. Seed the same 6 demo products
```bash
npm run seed
```

### 10. Create your first real admin account
1. Firebase Console → Authentication → Users → **Add user** (set an email + password)
2. Copy that user's **UID** (shown in the Users list)
3. Firestore Database → **Start collection** → collection ID: `adminProfiles`
   → document ID: paste that UID → add fields: `name` (string, your name),
   `role` (string, `"admin"`)

### 11. Run it locally (optional, to test before deploying)
```bash
npm run dev
```
Visit `http://localhost:3000` — you should see "✅ Firestore connected. 6
products found."

### 12. Deploy live on Vercel

1. **Push this project to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial Firebase backend"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
2. Go to **vercel.com** → sign in → **Add New Project** → select your repo.
   Vercel auto-detects Next.js — no build settings need changing.
3. Before clicking Deploy, open **Environment Variables** and add every
   value from your `.env` file, one by one:
   `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`,
   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`,
   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`,
   `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.

   For `FIREBASE_PRIVATE_KEY` specifically: paste it as one single-line
   value with literal `\n` characters (exactly like it looks in your
   `.env` file) — don't try to paste it as an actual multi-line value.
4. Click **Deploy**.
5. Once done, Vercel gives you a live URL like
   `https://your-project-name.vercel.app`. Open it — if you see "✅
   Firestore connected. 6 products found," your database and deployment
   are both working end to end.

**If the build fails**, double-check every environment variable was added
exactly as it appears in your `.env`, then redeploy from the Vercel
dashboard (no need to push new code for an env var fix — just redeploy).

**No payment method needed anywhere in this setup** — Firebase stays on
Spark (Firestore + Auth are free), and Vercel's free Hobby tier covers
hosting a project at this scale.

## What still needs frontend work

This delivers the data layer and API only. The actual storefront/admin UI
(the interactive HTML file) still needs its JavaScript updated to call
these `/api/...` routes and Firebase Auth instead of its in-memory array
and fake login.

## File guide
```
lib/firebaseAdmin.ts       Server-side Firebase Admin SDK (Firestore + Auth)
lib/firebaseClient.ts      Browser-side Firebase SDK (used by the login page)
lib/requireAdmin.ts        Verifies a request's Firebase ID token + admin status
firestore.rules            Security rules (equivalent to Postgres RLS policies)
scripts/seed.mjs           Populates the same 6 demo products
app/api/products/          List/create, get/update/delete by slug
app/api/orders/            List (admin), create (checkout), update status
app/api/reviews/           List, submit, approve/reject/delete
app/api/blog/              List/create, get/update/delete by slug
app/api/customers/         List, with totals computed from real orders
app/api/settings/          Get/update site-wide settings (WhatsApp number etc.)
app/api/admin/verify/      Confirms a logged-in Firebase user is an admin
app/admin/login/page.tsx   Example real login screen (Firebase Auth)
```
