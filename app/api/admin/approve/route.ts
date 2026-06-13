import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dvtkcuqwvkakycsseydh.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q';

function getAdminClient() {
  return createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
}

async function getAdmin(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const sb = getAdminClient();
  const { data: { user } } = await sb.auth.getUser(auth.slice(7));
  return user;
}

export async function POST(request: NextRequest) {
  const admin = await getAdmin(request);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });

  const { paper_id, admin_note } = await request.json();
  if (!paper_id) return NextResponse.json({ success: false, error: 'paper_id required.' }, { status: 400 });

  const sb = getAdminClient();

  const { data: paper } = await sb.from('papers').select('id,file_path,status').eq('id', paper_id).single();
  if (!paper) return NextResponse.json({ success: false, error: 'Paper not found.' }, { status: 404 });
  if (paper.status !== 'Pending') return NextResponse.json({ success: false, error: 'Only pending papers can be approved.' }, { status: 409 });

  // Move file from pending/ to approved/
  const newPath = paper.file_path.startsWith('pending/')
    ? paper.file_path.replace('pending/', 'approved/')
    : paper.file_path;

  if (paper.file_path !== newPath) {
    await sb.storage.from('papers').move(paper.file_path, newPath);
  }

  // Always use direct public storage URL
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/papers/${newPath}`;

  const { error } = await sb.from('papers').update({
    status: 'Approved',
    file_path: newPath,
    file_url: publicUrl,
    admin_note: admin_note ?? null,
    reviewed_by: admin.id,
    reviewed_at: new Date().toISOString(),
  }).eq('id', paper_id);

  if (error) return NextResponse.json({ success: false, error: 'Update failed.' }, { status: 500 });
  return NextResponse.json({ success: true, message: 'Paper approved.' });
}

export async function PATCH(request: NextRequest) {
  const admin = await getAdmin(request);
  if (!admin) return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });

  const { paper_id, admin_note } = await request.json();
  if (!paper_id || !admin_note?.trim()) {
    return NextResponse.json({ success: false, error: 'paper_id and reason required.' }, { status: 400 });
  }

  const sb = getAdminClient();
  await sb.from('papers').update({
    status: 'Rejected',
    admin_note,
    reviewed_by: admin.id,
    reviewed_at: new Date().toISOString(),
  }).eq('id', paper_id).eq('status', 'Pending');

  return NextResponse.json({ success: true, message: 'Paper rejected.' });
}
