// app/(public)/papers/page.tsx
import { Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import { PaperCard } from '@/components/papers/PaperCard';
import { PaperFiltersBar } from '@/components/papers/PaperFiltersBar';
import type { Department, Teacher, Subject, PaperPublic } from '@/types';

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

async function getFilterOptions() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [{ data: departments }, { data: teachers }, { data: subjects }] =
    await Promise.all([
      supabase.from('departments').select('id,name,code').eq('is_active', true).order('name'),
      supabase.from('teachers').select('id,name,department_id').eq('is_active', true).order('name'),
      supabase.from('subjects').select('id,name,course_code,teacher_id').eq('is_active', true).order('name'),
    ]);
  return {
    departments: (departments ?? []) as Department[],
    teachers: (teachers ?? []) as Teacher[],
    subjects: (subjects ?? []) as Subject[],
  };
}

async function getPapers(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/papers?${qs}`,
    { next: { revalidate: 60 } }
  );
  const json = await res.json();
  return {
    papers: (json.data ?? []) as PaperPublic[],
    count: json.count ?? 0,
    totalPages: json.totalPages ?? 1,
    page: json.page ?? 1,
  };
}

export default async function PapersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [filterOptions, { papers, count, totalPages, page }] = await Promise.all([
    getFilterOptions(),
    getPapers(params),
  ]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Past Papers</h1>
        <p className="text-muted-foreground mt-1">
          {count.toLocaleString()} paper{count !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Filters — server-rendered, URL-driven */}
      <PaperFiltersBar
        departments={filterOptions.departments}
        teachers={filterOptions.teachers}
        subjects={filterOptions.subjects}
        years={years}
        currentParams={params}
      />

      {/* Results */}
      <div className="mt-6">
        {papers.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No papers found</p>
            <p className="text-sm mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {papers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const newParams = new URLSearchParams(params);
                  newParams.set('page', String(p));
                  return (
                    <a
                      key={p}
                      href={`/papers?${newParams.toString()}`}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                        p === page
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      {p}
                    </a>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Past Papers — NTU Past Papers Archive',
  description:
    'Browse and download past exam papers from National Textile University. Filter by department, teacher, subject, semester, and more.',
};
