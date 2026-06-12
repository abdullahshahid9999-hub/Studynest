'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70');

const DEPT_MAP: Record<string,string> = {
  CS:'Department of Computer Science', TE:'Textile Engineering',
  ME:'Mechanical Engineering', MS:'Management Sciences',
  EE:'Electrical Engineering', CHE:'Chemical Engineering', ENV:'Environmental Sciences',
};

function parseRoll(roll: string) {
  const m = roll.trim().toUpperCase().match(/^(\d{2})-([A-Z]+)-([A-Z]+)-([A-Z]+)-(\d{4,6})$/);
  if (!m) return null;
  const [,yr,uni,dept] = m;
  if (uni !== 'NTU') return null;
  return { departmentCode: dept, departmentName: DEPT_MAP[dept] ?? dept };
}

const SEMESTERS = ['1','2','3','4','5','6','7','8'];
const CY = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_,i) => CY - i);

export default function ContributePage() {
  const [roll, setRoll] = useState('');
  const [deptInfo, setDeptInfo] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teacherId, setTeacherId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [examType, setExamType] = useState('');
  const [semester, setSemester] = useState('');
  const [term, setTerm] = useState('');
  const [year, setYear] = useState(CY);
  const [file, setFile] = useState<File|null>(null);
  const [fileErr, setFileErr] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const parsed = parseRoll(roll);
    if (!parsed) { setDeptInfo(null); setTeachers([]); setTeacherId(''); setSubjects([]); setSubjectId(''); return; }
    setDeptInfo(parsed);
    sb.from('departments').select('id').eq('code', parsed.departmentCode).eq('is_active',true).single()
      .then(({ data: dept }) => {
        if (!dept) return;
        sb.from('teachers').select('id,name').eq('department_id', dept.id).eq('is_active',true).order('name')
          .then(({ data }) => { setTeachers(data ?? []); setTeacherId(''); setSubjects([]); setSubjectId(''); });
      });
  }, [roll]);

  useEffect(() => {
    if (!teacherId) { setSubjects([]); setSubjectId(''); return; }
    sb.from('subjects').select('id,name,course_code').eq('teacher_id',teacherId).eq('is_active',true).order('name')
      .then(({ data }) => { setSubjects(data ?? []); setSubjectId(''); });
  }, [teacherId]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFileErr('');
    if (!f) { setFile(null); return; }
    const allowed = ['application/pdf','image/jpeg','image/jpg','image/png','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(f.type)) { setFileErr('Invalid file type. Allowed: PDF, JPG, PNG, DOCX'); setFile(null); return; }
    if (f.size > 20*1024*1024) { setFileErr('File too large. Max 20MB.'); setFile(null); return; }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setFileErr('Please select a file.'); return; }
    if (!teacherId || !subjectId || !examType || !semester || !term) { setMsg('Please fill all fields.'); setStatus('error'); return; }
    setStatus('loading');

    const fd = new FormData();
    fd.append('roll_number', roll.trim().toUpperCase());
    fd.append('teacher_id', teacherId);
    fd.append('subject_id', subjectId);
    fd.append('exam_type', examType);
    fd.append('semester', semester);
    fd.append('term', term);
    fd.append('year', String(year));
    fd.append('file', file);
    fd.append('recaptcha_token', 'bypass');

    const res = await fetch('/api/contribute', { method: 'POST', body: fd });
    const json = await res.json();
    if (json.success) { setStatus('success'); setMsg(json.message); }
    else { setStatus('error'); setMsg(json.error); }
  };

  const inp = { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };
  const lbl = { display: 'block', fontSize: '13px', fontWeight: '500' as const, marginBottom: '5px', color: '#374151' };

  if (status === 'success') return (
    <div style={{ maxWidth: '560px', margin: '60px auto', textAlign: 'center', fontFamily: 'system-ui' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
      <h2 style={{ fontWeight: 'bold', fontSize: '1.4rem', marginBottom: '8px' }}>Submitted Successfully!</h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>{msg}</p>
      <button onClick={() => { setStatus('idle'); setRoll(''); setFile(null); setTeacherId(''); setSubjectId(''); setExamType(''); setSemester(''); setTerm(''); setYear(CY); }}
        style={{ padding: '10px 28px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>
        Submit Another Paper
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '6px' }}>Contribute a Paper</h1>
      <p style={{ color: '#6b7280', marginBottom: '28px' }}>Share past exam papers to help fellow NTU students. Papers are reviewed before going public.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Roll Number */}
        <div>
          <label style={lbl}>Roll Number *</label>
          <input value={roll} onChange={e => setRoll(e.target.value)} placeholder="e.g. 25-NTU-CS-FL-1124" required style={inp} />
          {deptInfo && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '5px' }}>✓ Detected: {deptInfo.departmentCode} — {deptInfo.departmentName}</p>}
          {roll.length > 5 && !deptInfo && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '5px' }}>Invalid roll number format</p>}
        </div>

        {/* Teacher */}
        <div>
          <label style={lbl}>Teacher *</label>
          <select value={teacherId} onChange={e => setTeacherId(e.target.value)} required disabled={!deptInfo || teachers.length === 0} style={inp}>
            <option value="">{!deptInfo ? 'Enter roll number first' : teachers.length === 0 ? 'No teachers found' : 'Select teacher'}</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label style={lbl}>Subject *</label>
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required disabled={!teacherId || subjects.length === 0} style={inp}>
            <option value="">{!teacherId ? 'Select teacher first' : subjects.length === 0 ? 'No subjects found' : 'Select subject'}</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.course_code} — {s.name}</option>)}
          </select>
        </div>

        {/* Exam Type + Semester */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={lbl}>Exam Type *</label>
            <select value={examType} onChange={e => setExamType(e.target.value)} required style={inp}>
              <option value="">Select</option>
              <option value="Mid">Mid</option>
              <option value="Final">Final</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Semester *</label>
            <select value={semester} onChange={e => setSemester(e.target.value)} required style={inp}>
              <option value="">Select</option>
              {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
        </div>

        {/* Term + Year */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={lbl}>Term *</label>
            <select value={term} onChange={e => setTerm(e.target.value)} required style={inp}>
              <option value="">Select</option>
              <option value="Spring">Spring</option>
              <option value="Fall">Fall</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Year *</label>
            <select value={year} onChange={e => setYear(parseInt(e.target.value))} style={inp}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label style={lbl}>Paper File * (PDF, JPG, PNG, DOCX — max 20MB)</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={handleFile} required
            style={{ ...inp, padding: '7px', cursor: 'pointer' }} />
          {file && <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '5px' }}>✓ {file.name} ({(file.size/1024/1024).toFixed(2)} MB)</p>}
          {fileErr && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '5px' }}>{fileErr}</p>}
        </div>

        {status === 'error' && msg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '12px', color: '#dc2626', fontSize: '13px' }}>
            {msg === 'This paper already exists. For corrections or disputes, please contact administration.'
              ? '⚠️ This paper already exists. For corrections or disputes, please contact administration.'
              : '⚠️ ' + msg}
          </div>
        )}

        <button type="submit" disabled={status === 'loading'}
          style={{ padding: '12px', background: status === 'loading' ? '#94a3b8' : '#1d4ed8', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}>
          {status === 'loading' ? 'Submitting...' : 'Submit Paper'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
          Your roll number is stored only for leaderboard tracking. Papers are reviewed before going public.
        </p>
      </form>
    </div>
  );
}
