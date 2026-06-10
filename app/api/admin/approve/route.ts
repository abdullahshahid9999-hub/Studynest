// app/api/admin/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { adminApproveSchema, adminRejectSchema } from '@/lib/validations/schemas';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function getAuthenticatedAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const supabase = getAdminClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// POST /api/admin/approve
export async function POST(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = adminApproveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0].message },
      { status: 422 }
    );
  }

  const supabase = getAdminClient();

  // Fetch paper to get file_path
  const { data: paper, error: fetchErr } = await supabase
    .from('papers')
    .select('id, file_path, file_type, status')
    .eq('id', parsed.data.paper_id)
    .single();

  if (fetchErr || !paper) {
    return NextResponse.json({ success: false, error: 'Paper not found.' }, { status: 404 });
  }

  if (paper.status !== 'Pending') {
    return NextResponse.json(
      { success: false, error: 'Only pending papers can be approved.' },
      { status: 409 }
    );
  }

  // Move file from pending/ to approved/ in storage
  const newPath = paper.file_path.replace('pending/', 'approved/');
  const { error: moveErr } = await supabase.storage
    .from('papers')
    .move(paper.file_path, newPath);

  if (moveErr) {
    console.error('Storage move error:', moveErr);
    return NextResponse.json(
      { success: false, error: 'Failed to move file to approved storage.' },
      { status: 500 }
    );
  }

  // Generate public URL
  const { data: urlData } = supabase.storage
    .from('papers')
    .getPublicUrl(newPath);

  // Update paper record
  const { error: updateErr } = await supabase
    .from('papers')
    .update({
      status: 'Approved',
      file_path: newPath,
      file_url: urlData?.publicUrl ?? null,
      admin_note: parsed.data.admin_note ?? null,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.paper_id);

  if (updateErr) {
    return NextResponse.json(
      { success: false, error: 'Failed to update paper status.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, message: 'Paper approved successfully.' });
}

// ============================================================
// app/api/admin/reject/route.ts — same file for brevity
// In production, put this in app/api/admin/reject/route.ts
// ============================================================

export async function PATCH(request: NextRequest) {
  const admin = await getAuthenticatedAdmin(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = adminRejectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0].message },
      { status: 422 }
    );
  }

  const supabase = getAdminClient();

  const { error } = await supabase
    .from('papers')
    .update({
      status: 'Rejected',
      admin_note: parsed.data.admin_note,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.paper_id)
    .eq('status', 'Pending');

  if (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to reject paper.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, message: 'Paper rejected.' });
}
