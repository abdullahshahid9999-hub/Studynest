'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q');

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [credits, setCredits] = useState('');
  const [editId, setEditId] = useState<string|null>(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [{ data: s }, { data: t }] = await Promise.all([
      sb.from('subjects').select('*, teachers(name, departments(code))').order('name'),
      sb.from('teachers').select('id,name,department_id,departments(code)').eq('is_active',true).order('name'),
    ]);
    setSubjects(s ?? []); setTeachers(t ?? []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!name.trim() || !courseCode.trim() || !teacherId) { setMsg('All required fields must be filled.'); return; }
    setLoading(true);
    const payload = { name: name.trim(), course_code: courseCode.trim().toUpperCase(), teacher_id: teacherId, credits: credits ? parseInt(credits) : null };
    if (editId) {
      await sb.from('subjects').update(payload).eq('id', editId);
      setMsg('Updated!');
    } else {
      const { error } = await sb.from('subjects').insert(payload);
      if (error) { setMsg('Error: ' + error.message); setLoading(false); return; }
      setMsg('Added!');
    }
    setName(''); setCourseCode(''); setTeacherId(''); setCredits(''); setEditId(null);
    await load(); setLoading(false);
    setTimeout(() => setMsg(''), 2000);
  };

  const del = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    await sb.from('subjects').delete().eq('id', id);
    await load();
  };

  const edit = (s: any) => { setEditId(s.id); setName(s.name); setCourseCode(s.course_code); setTeacherId(s.teacher_id); setCredits(s.credits?.toString() ?? ''); };
  const inp = { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '24px' }}>Subjects</h1>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>{editId ? 'Edit Subject' : 'Add Subject'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Subject Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Data Structures" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Course Code *</label>
            <input value={courseCode} onChange={e => setCourseCode(e.target.value)} placeholder="CS201" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Teacher *</label>
            <select value={teacherId} onChange={e => setTeacherId(e.target.value)} style={inp}>
              <option value="">Select Teacher</option>
              {teachers.map(t => <option key={t.id} value={t.id}>[{(t.departments as any)?.code}] {t.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Credits</label>
            <input value={credits} onChange={e => setCredits(e.target.value)} placeholder="3" type="number" min="1" max="6" style={inp} />
          </div>
        </div>
        {msg && <p style={{ color: msg.startsWith('Error') ? '#dc2626' : '#16a34a', fontSize: '13px', marginBottom: '8px' }}>{msg}</p>}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={save} disabled={loading}
            style={{ padding: '8px 20px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            {loading ? 'Saving...' : editId ? 'Update' : 'Add Subject'}
          </button>
          {editId && <button onClick={() => { setEditId(null); setName(''); setCourseCode(''); setTeacherId(''); setCredits(''); }}
            style={{ padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>}
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Subject</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Code</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Teacher</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Credits</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < subjects.length-1 ? '1px solid #f3f4f6' : 'none' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{s.name}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>{s.course_code}</span></td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{s.teachers?.name}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{s.credits || '—'}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button onClick={() => edit(s)} style={{ marginRight: '8px', padding: '5px 12px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                  <button onClick={() => del(s.id)} style={{ padding: '5px 12px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                </td>
              </tr>
            ))}
            {subjects.length === 0 && <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No subjects yet. Add teachers first.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
