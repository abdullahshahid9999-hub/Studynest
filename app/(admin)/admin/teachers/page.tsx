'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q');

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [deptId, setDeptId] = useState('');
  const [designation, setDesignation] = useState('');
  const [editId, setEditId] = useState<string|null>(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [{ data: t }, { data: d }] = await Promise.all([
      sb.from('teachers').select('*, departments(name,code)').order('name'),
      sb.from('departments').select('id,name,code').eq('is_active', true).order('name'),
    ]);
    setTeachers(t ?? []); setDepts(d ?? []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!name.trim() || !deptId) { setMsg('Name and department required.'); return; }
    setLoading(true);
    if (editId) {
      await sb.from('teachers').update({ name: name.trim(), department_id: deptId, designation: designation.trim() }).eq('id', editId);
      setMsg('Updated!');
    } else {
      const { error } = await sb.from('teachers').insert({ name: name.trim(), department_id: deptId, designation: designation.trim() });
      if (error) { setMsg('Error: ' + error.message); setLoading(false); return; }
      setMsg('Added!');
    }
    setName(''); setDeptId(''); setDesignation(''); setEditId(null);
    await load(); setLoading(false);
    setTimeout(() => setMsg(''), 2000);
  };

  const del = async (id: string) => {
    if (!confirm('Delete this teacher?')) return;
    await sb.from('teachers').delete().eq('id', id);
    await load();
  };

  const edit = (t: any) => { setEditId(t.id); setName(t.name); setDeptId(t.department_id); setDesignation(t.designation ?? ''); };
  const inp = { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '24px' }}>Teachers</h1>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>{editId ? 'Edit Teacher' : 'Add Teacher'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Full Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Ahmed Ali" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Department *</label>
            <select value={deptId} onChange={e => setDeptId(e.target.value)} style={inp}>
              <option value="">Select Department</option>
              {depts.map(d => <option key={d.id} value={d.id}>{d.code} - {d.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Designation</label>
            <input value={designation} onChange={e => setDesignation(e.target.value)} placeholder="Lecturer / Asst. Prof" style={inp} />
          </div>
        </div>
        {msg && <p style={{ color: msg.startsWith('Error') ? '#dc2626' : '#16a34a', fontSize: '13px', marginBottom: '8px' }}>{msg}</p>}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={save} disabled={loading}
            style={{ padding: '8px 20px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            {loading ? 'Saving...' : editId ? 'Update' : 'Add Teacher'}
          </button>
          {editId && <button onClick={() => { setEditId(null); setName(''); setDeptId(''); setDesignation(''); }}
            style={{ padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>}
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Department</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Designation</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < teachers.length-1 ? '1px solid #f3f4f6' : 'none' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{t.name}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>{t.departments?.code}</span><span style={{ marginLeft: '6px', fontSize: '13px', color: '#6b7280' }}>{t.departments?.name}</span></td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>{t.designation || '—'}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button onClick={() => edit(t)} style={{ marginRight: '8px', padding: '5px 12px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                  <button onClick={() => del(t.id)} style={{ padding: '5px 12px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                </td>
              </tr>
            ))}
            {teachers.length === 0 && <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No teachers yet. Add departments first.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
