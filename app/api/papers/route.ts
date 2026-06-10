// app/api/papers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { paperFiltersSchema } from '@/lib/validations/schemas';
import { rateLimit, getClientIp } from '@/lib/utils/rateLimit';

function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);

  // Light rate limit for browsing: 120 req/min per IP
  const rl = rateLimit(`papers:${ip}`, { windowMs: 60_000, max: 120 });
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);

  const rawFilters = {
    department_id: searchParams.get('department_id') ?? undefined,
    teacher_id: searchParams.get('teacher_id') ?? undefined,
    subject_id: searchParams.get('subject_id') ?? undefined,
    exam_type: searchParams.get('exam_type') ?? undefined,
    semester: searchParams.get('semester') ?? undefined,
    term: searchParams.get('term') ?? undefined,
    year: searchParams.get('year') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    page: searchParams.get('page') ?? '1',
    limit: searchParams.get('limit') ?? '12',
  };

  const parsed = paperFiltersSchema.safeParse(rawFilters);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0].message },
      { status: 422 }
    );
  }

  const { page, limit, search, ...filters } = parsed.data;
  const offset = (page - 1) * limit;

  const supabase = getPublicClient();

  // Build query against the public view
  let query = supabase
    .from('v_papers_public')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters.department_id) query = query.eq('department_id', filters.department_id);
  if (filters.teacher_id)    query = query.eq('teacher_id', filters.teacher_id);
  if (filters.subject_id)    query = query.eq('subject_id', filters.subject_id);
  if (filters.exam_type)     query = query.eq('exam_type', filters.exam_type);
  if (filters.semester)      query = query.eq('semester', filters.semester);
  if (filters.term)          query = query.eq('term', filters.term);
  if (filters.year)          query = query.eq('year', filters.year);

  // Full-text search across subject name and teacher name
  if (search) {
    query = query.or(
      `subject_name.ilike.%${search}%,teacher_name.ilike.%${search}%,course_code.ilike.%${search}%`
    );
  }

  // Pagination + ordering
  const { data, error, count } = await query
    .order('year', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Papers query error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch papers.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data,
      count: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
    {
      status: 200,
      headers: {
        // Cache for 60 seconds at CDN level
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
