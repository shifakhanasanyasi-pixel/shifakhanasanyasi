import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';

// POST /api/admin/verify — called right after Firebase login succeeds, to
// confirm this user also has an adminProfiles document.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Not an admin' }, { status: 401 });
  return NextResponse.json(admin.profile);
}
