// app/api/contribute/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { contributeSchema, validateUploadedFile } from '@/lib/validations/schemas';
import { parseRollNumber } from '@/lib/utils/rollNumber';
import { rateLimit, getClientIp, verifyRecaptcha } from '@/lib/utils/rateLimit';
import { v4 as uuidv4 } from 'uuid';

// Admin client — bypasses RLS for server-side writes
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // ── Rate limiting: 5 submissions per 10 minutes per IP
  const rl = rateLimit(ip, { windowMs: 10 * 60_000, max: 5 });
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many submissions. Please wait before trying again.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid form data.' },
      { status: 400 }
    );
  }

  // ── Parse fields from FormData
  const fields = {
    roll_number: formData.get('roll_number') as string,
    teacher_id: formData.get('teacher_id') as string,
    subject_id: formData.get('subject_id') as string,
    exam_type: formData.get('exam_type') as string,
    semester: formData.get('semester') as string,
    term: formData.get('term') as string,
    year: Number(formData.get('year')),
    recaptcha_token: formData.get('recaptcha_token') as string,
  };

  // ── Zod validation
  const parsed = contributeSchema.safeParse(fields);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0].message },
      { status: 422 }
    );
  }

  // ── reCAPTCHA verification
  const captchaOk = await verifyRecaptcha(parsed.data.recaptcha_token);
  if (!captchaOk) {
    return NextResponse.json(
      { success: false, error: 'reCAPTCHA verification failed. Please try again.' },
      { status: 403 }
    );
  }

  // ── File extraction
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json(
      { success: false, error: 'No file uploaded.' },
      { status: 400 }
    );
  }

  // ── File validation
  const fileCheck = validateUploadedFile({
    name: file.name,
    type: file.type,
    size: file.size,
  });
  if (!fileCheck.valid) {
    return NextResponse.json(
      { success: false, error: fileCheck.error },
      { status: 400 }
    );
  }

  // ── Parse roll number → get department code
  const rollParsed = parseRollNumber(parsed.data.roll_number);
  if (!rollParsed.isValid) {
    return NextResponse.json(
      { success: false, error: 'Invalid roll number format.' },
      { status: 422 }
    );
  }

  const supabase = getAdminClient();

  // ── Look up department by code
  const { data: dept, error: deptErr } = await supabase
    .from('departments')
    .select('id')
    .eq('code', rollParsed.departmentCode)
    .eq('is_active', true)
    .single();

  if (deptErr || !dept) {
    return NextResponse.json(
      { success: false, error: `Department "${rollParsed.departmentCode}" not found.` },
      { status: 400 }
    );
  }

  // ── Duplicate detection (same combo already exists as Approved)
  const { count: dupeCount } = await supabase
    .from('papers')
    .select('id', { count: 'exact', head: true })
    .eq('department_id', dept.id)
    .eq('teacher_id', parsed.data.teacher_id)
    .eq('subject_id', parsed.data.subject_id)
    .eq('exam_type', parsed.data.exam_type)
    .eq('semester', parsed.data.semester)
    .eq('term', parsed.data.term)
    .eq('year', parsed.data.year)
    .eq('status', 'Approved');

  if ((dupeCount ?? 0) > 0) {
    return NextResponse.json(
      {
        success: false,
        error:
          'This paper already exists. For corrections or disputes, please contact administration.',
        code: 'DUPLICATE',
      },
      { status: 409 }
    );
  }

  // ── Upload file to Supabase Storage (private "papers" bucket)
  const fileBuffer = await file.arrayBuffer();
  const fileExt = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const storagePath = `pending/${uuidv4()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('papers')
    .upload(storagePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    return NextResponse.json(
      { success: false, error: 'File upload failed. Please try again.' },
      { status: 500 }
    );
  }

  // ── Upsert contributor (by roll number)
  const { data: contributor, error: contribErr } = await supabase
    .from('contributors')
    .upsert(
      {
        roll_number: parsed.data.roll_number.toUpperCase(),
        department_id: dept.id,
      },
      { onConflict: 'roll_number' }
    )
    .select('id')
    .single();

  if (contribErr || !contributor) {
    console.error('Contributor upsert error:', contribErr);
  }

  // ── Insert paper record
  const { data: paper, error: paperErr } = await supabase
    .from('papers')
    .insert({
      department_id: dept.id,
      teacher_id: parsed.data.teacher_id,
      subject_id: parsed.data.subject_id,
      contributor_id: contributor?.id ?? null,
      exam_type: parsed.data.exam_type,
      semester: parsed.data.semester,
      term: parsed.data.term,
      year: parsed.data.year,
      file_path: storagePath,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      roll_number: parsed.data.roll_number.toUpperCase(),
      upload_ip: ip,
      status: 'Pending',
    })
    .select('id')
    .single();

  if (paperErr || !paper) {
    console.error('Paper insert error:', paperErr);
    // Clean up orphaned file
    await supabase.storage.from('papers').remove([storagePath]);
    return NextResponse.json(
      { success: false, error: 'Submission failed. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      message:
        'Paper submitted successfully! It will be visible after admin review.',
      paper_id: paper.id,
    },
    { status: 201 }
  );
}
