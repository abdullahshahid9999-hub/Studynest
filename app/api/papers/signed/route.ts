import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://dvtkcuqwvkakycsseydh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q',
  { auth: { persistSession: false } }
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const action = searchParams.get('action') ?? 'view'; // view | download

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  // Get paper
  const { data: paper, error } = await sb
    .from('papers')
    .select('id, file_path, file_name, status')
    .eq('id', id)
    .eq('status', 'Approved')
    .single();

  if (error || !paper) {
    return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
  }

  // Generate signed URL valid for 1 hour
  const { data: signed, error: signErr } = await sb.storage
    .from('papers')
    .createSignedUrl(paper.file_path, 3600, {
      download: action === 'download' ? paper.file_name : false,
    });

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json({ error: 'Could not generate URL' }, { status: 500 });
  }

  // If download, redirect directly
  if (action === 'download') {
    return NextResponse.redirect(signed.signedUrl);
  }

  return NextResponse.json({ url: signed.signedUrl });
}
