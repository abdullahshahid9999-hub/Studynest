'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q');

const DEPT_MAP: Record<string,string> = {
  CS:'Computer Science', TE:'Textile Engineering', ME:'Mechanical Engineering',
  MS:'Management Sciences', EE:'Electrical Engineering',
  CHE:'Chemical Engineering', ENV:'Environmental Sciences',
};

function parseRoll(roll: string) {
  const m = roll.trim().toUpperCase().match(/^\d{2}-NTU-([A-Z]+)-[A-Z]+-\d{4,6}$/);
  return m ? { code: m[1], name: DEPT_MAP[m[1]] ?? m[1] } : null;
}

export default function PapersPage() {
  const [roll, setRoll]           = useState('');
  const [dept, setDept]           = useState<any>(null);
  const [teachers, setTeachers]   = useState<any[]>([]);
  const [teacherId, setTeacherId] = useState('');
  const [subjects, setSubjects]   = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [papers, setPapers]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [preview, setPreview]     = useState<{url:string;paper:any}|null>(null);
  const [busy, setBusy]           = useState<string|null>(null);
  const [step, setStep]           = useState<1|2|3|4>(1); // 1=roll, 2=teacher, 3=subject, 4=results

  // Step 1: Parse roll → load teachers
  const handleRoll = async () => {
    const parsed = parseRoll(roll);
    if (!parsed) return;
    setDept(parsed);
    setTeacherId(''); setSubjectId(''); setPapers([]); setSearched(false);

    const { data: deptRow } = await sb.from('departments').select('id').eq('code', parsed.code).eq('is_active', true).single();
    if (!deptRow) return;

    const { data: t } = await sb.from('teachers').select('id,name').eq('department_id', deptRow.id).eq('is_active', true).order('name');
    setTeachers(t ?? []);
    setStep(2);
  };

  // Step 2: Teacher selected → load subjects
  const handleTeacher = async (tid: string) => {
    setTeacherId(tid);
    setSubjectId(''); setPapers([]); setSearched(false);
    const { data: s } = await sb.from('subjects').select('id,name,course_code').eq('teacher_id', tid).eq('is_active', true).order('name');
    setSubjects(s ?? []);
    setStep(3);
  };

  // Step 3: Subject selected → load papers
  const handleSubject = async (sid: string) => {
    setSubjectId(sid);
    setLoading(true); setSearched(true);

    const { data, error } = await sb.from('papers')
      .select('id, exam_type, semester, term, year, file_path, subjects(name,course_code), teachers(name), departments(name,code)')
      .eq('status', 'Approved')
      .eq('subject_id', sid)
      .order('year', { ascending: false });

    if (error) console.error(error);
    setPapers(data ?? []);
    setLoading(false);
    setStep(4);
  };

  const getSignedUrl = async (paperId: string) => {
    const res = await fetch(`/api/papers/signed?id=${paperId}`);
    if (!res.ok) return null;
    const j = await res.json();
    return j.url ?? null;
  };

  const handleView = async (paper: any) => {
    setBusy(paper.id);
    const url = await getSignedUrl(paper.id);
    setBusy(null);
    if (!url) { alert('Could not load paper.'); return; }
    setPreview({ url, paper });
  };

  const handleDownload = (paper: any) => {
    window.open(`/api/papers/signed?id=${paper.id}&action=download`, '_blank');
  };

  const reset = () => {
    setRoll(''); setDept(null); setTeachers([]); setTeacherId('');
    setSubjects([]); setSubjectId(''); setPapers([]); setSearched(false); setStep(1);
  };

  const inp: React.CSSProperties = {
    padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 8,
    fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none', color: '#111',
    transition: 'border-color 0.15s',
  };

  const selectedTeacher = teachers.find(t => t.id === teacherId);
  const selectedSubject = subjects.find(s => s.id === subjectId);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 6 }}>Past Papers</h1>
      <p style={{ fontSize: 14, color: '#888', marginBottom: 28 }}>Enter your roll number to find papers for your department.</p>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, alignItems: 'center' }}>
        {['Roll Number','Teacher','Subject','Papers'].map((label, i) => {
          const stepNum = (i + 1) as 1|2|3|4;
          const active = step === stepNum;
          const done = step > stepNum;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  background: done ? '#059669' : active ? '#111' : '#e0e0e0',
                  color: done || active ? '#fff' : '#888',
                }}>
                  {done ? '✓' : stepNum}
                </div>
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#111' : done ? '#059669' : '#999' }}>
                  {label}
                </span>
              </div>
              {i < 3 && <div style={{ width: 24, height: 1, background: '#e0e0e0' }} />}
            </div>
          );
        })}
        {step > 1 && (
          <button onClick={reset} style={{ marginLeft: 'auto', padding: '5px 12px', background: 'transparent', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, color: '#888', cursor: 'pointer' }}>
            Start Over
          </button>
        )}
      </div>

      {/* STEP 1: Roll Number */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>YOUR ROLL NUMBER</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={roll}
            onChange={e => { setRoll(e.target.value); setDept(parseRoll(e.target.value)); }}
            onKeyDown={e => e.key === 'Enter' && parseRoll(roll) && handleRoll()}
            placeholder="e.g. 25-NTU-CS-FL-1124"
            style={inp}
            onFocus={e => (e.target.style.borderColor = '#111')}
            onBlur={e => (e.target.style.borderColor = '#e0e0e0')}
          />
          <button
            onClick={handleRoll}
            disabled={!parseRoll(roll)}
            style={{
              padding: '10px 20px', background: parseRoll(roll) ? '#111' : '#e0e0e0',
              color: parseRoll(roll) ? '#fff' : '#aaa',
              border: 'none', borderRadius: 8, cursor: parseRoll(roll) ? 'pointer' : 'not-allowed',
              fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            Find Papers
          </button>
        </div>
        {dept && (
          <p style={{ fontSize: 12, color: '#059669', marginTop: 7, fontWeight: 500 }}>
            ✓ Detected: {dept.code} — {dept.name}
          </p>
        )}
        {roll.length > 8 && !dept && (
          <p style={{ fontSize: 12, color: '#dc2626', marginTop: 7 }}>Invalid roll number format</p>
        )}
      </div>

      {/* STEP 2: Teacher */}
      {step >= 2 && teachers.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 12 }}>SELECT TEACHER</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {teachers.map(t => (
              <button key={t.id} onClick={() => handleTeacher(t.id)}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
                  background: teacherId === t.id ? '#111' : '#f5f5f5',
                  color: teacherId === t.id ? '#fff' : '#333',
                  border: teacherId === t.id ? '1px solid #111' : '1px solid #e0e0e0',
                  fontWeight: teacherId === t.id ? 600 : 400,
                }}>
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Subject */}
      {step >= 3 && subjects.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 12 }}>SELECT SUBJECT</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {subjects.map(s => (
              <button key={s.id} onClick={() => handleSubject(s.id)}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
                  background: subjectId === s.id ? '#111' : '#f5f5f5',
                  color: subjectId === s.id ? '#fff' : '#333',
                  border: subjectId === s.id ? '1px solid #111' : '1px solid #e0e0e0',
                  fontWeight: subjectId === s.id ? 600 : 400,
                }}>
                <span style={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.7, marginRight: 6 }}>{s.course_code}</span>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Papers */}
      {searched && (
        <div>
          {loading ? (
            <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '32px', textAlign: 'center', color: '#888' }}>
              Loading papers…
            </div>
          ) : papers.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4 }}>No papers found</p>
              <p style={{ fontSize: 13, color: '#999' }}>
                No approved papers for <b>{selectedSubject?.name}</b> by <b>{selectedTeacher?.name}</b> yet.
              </p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
                {papers.length} paper{papers.length !== 1 ? 's' : ''} found for{' '}
                <b style={{ color: '#333' }}>{selectedSubject?.name}</b> by{' '}
                <b style={{ color: '#333' }}>{selectedTeacher?.name}</b>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
                {papers.map((p: any) => (
                  <div key={p.id}
                    style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.15s,border-color 0.15s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; el.style.borderColor = '#ccc'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = 'none'; el.style.borderColor = '#e8e8e8'; }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 2 }}>{p.subjects?.name}</div>
                        <div style={{ fontSize: 12, color: '#aaa', fontFamily: 'monospace' }}>{p.subjects?.course_code}</div>
                      </div>
                      <span style={{ padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: p.exam_type === 'Final' ? '#e8f0fe' : '#fef9e7', color: p.exam_type === 'Final' ? '#1a56db' : '#92400e' }}>
                        {p.exam_type}
                      </span>
                    </div>

                    <div style={{ flex: 1, fontSize: 13, color: '#666', lineHeight: 1.8, marginBottom: 14 }}>
                      <div>Semester {p.semester} · {p.term} {p.year}</div>
                      <div style={{ color: '#aaa', fontSize: 12 }}>{p.teachers?.name}</div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #f5f5f5', paddingTop: 12 }}>
                      <button onClick={() => handleView(p)} disabled={busy === p.id}
                        style={{ flex: 1, padding: '8px', background: '#111', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: busy === p.id ? 0.6 : 1 }}>
                        {busy === p.id ? 'Loading…' : 'View'}
                      </button>
                      <button onClick={() => handleDownload(p)}
                        style={{ flex: 1, padding: '8px', background: '#f5f5f5', color: '#333', border: '1px solid #e8e8e8', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* PDF Viewer */}
      {preview && (
        <div onClick={() => setPreview(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8e8e8', flexShrink: 0 }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{preview.paper.subjects?.name}</span>
              <span style={{ color: '#888', fontSize: 13, marginLeft: 10 }}>
                {preview.paper.subjects?.course_code} · {preview.paper.exam_type} · {preview.paper.term} {preview.paper.year}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleDownload(preview.paper)}
                style={{ padding: '7px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Download
              </button>
              <button onClick={() => setPreview(null)}
                style={{ background: '#f5f5f5', border: 'none', borderRadius: 7, width: 34, height: 34, fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
          </div>
          <div onClick={e => e.stopPropagation()} style={{ flex: 1, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1, transform: 'rotate(-20deg)' }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'rgba(0,0,0,0.04)', letterSpacing: 3, userSelect: 'none', whiteSpace: 'nowrap' }}>NTU PAST PAPERS</span>
            </div>
            <iframe src={preview.url + '#toolbar=0'} style={{ width: '100%', height: '100%', border: 'none' }} title="Paper" />
          </div>
        </div>
      )}
    </div>
  );
}
