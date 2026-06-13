import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dvtkcuqwvkakycsseydh.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { data: paper } = await sb.from('papers').select('file_path, status').eq('id', id).single();

  if (!paper || paper.status !== 'Approved') {
    return NextResponse.json({ error: 'Paper not found.' }, { status: 404 });
  }

  // Generate 1 hour signed URL
  const { data: signed } = await sb.storage.from('papers').createSignedUrl(paper.file_path, 3600);
  if (!signed?.signedUrl) return NextResponse.json({ error: 'Could not generate URL.' }, { status: 500 });

  return NextResponse.redirect(signed.signedUrl);
}
