'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q');

export default function DepartmentsPage() {
  const [depts, setDepts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [editId, setEditId] = useState<string|null>(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await sb.from('departments').select('*').order('name');
    setDepts(data ?? []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!name.trim() || !code.trim()) { setMsg('Name and code required.'); return; }
    setLoading(true);
    if (editId) {
      await sb.from('departments').update({ name: name.trim(), code: code.trim().toUpperCase() }).eq('id', editId);
      setMsg('Updated!');
    } else {
      const { error } = await sb.from('departments').insert({ name: name.trim(), code: code.trim().toUpperCase() });
      if (error) { setMsg('Error: ' + error.message); setLoading(false); return; }
      setMsg('Added!');
    }
    setName(''); setCode(''); setEditId(null);
    await load(); setLoading(false);
    setTimeout(() => setMsg(''), 2000);
  };

  const del = async (id: string) => {
    if (!confirm('Delete this department?')) return;
    await sb.from('departments').delete().eq('id', id);
    await load();
  };

  const edit = (d: any) => { setEditId(d.id); setName(d.name); setCode(d.code); };

  const inp = { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '24px' }}>Departments</h1>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>{editId ? 'Edit Department' : 'Add Department'}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Department Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Computer Science" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Code</label>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. CS" style={inp} />
          </div>
        </div>
        {msg && <p style={{ color: msg.startsWith('Error') ? '#dc2626' : '#16a34a', fontSize: '13px', marginBottom: '8px' }}>{msg}</p>}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={save} disabled={loading}
            style={{ padding: '8px 20px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
            {loading ? 'Saving...' : editId ? 'Update' : 'Add Department'}
          </button>
          {editId && <button onClick={() => { setEditId(null); setName(''); setCode(''); }}
            style={{ padding: '8px 16px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>}
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Code</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {depts.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: i < depts.length-1 ? '1px solid #f3f4f6' : 'none' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500' }}>{d.name}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>{d.code}</span></td>
                <td style={{ padding: '12px 16px' }}><span style={{ color: d.is_active ? '#16a34a' : '#dc2626', fontSize: '13px' }}>{d.is_active ? 'Active' : 'Inactive'}</span></td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button onClick={() => edit(d)} style={{ marginRight: '8px', padding: '5px 12px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}>Edit</button>
                  <button onClick={() => del(d.id)} style={{ padding: '5px 12px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                </td>
              </tr>
            ))}
            {depts.length === 0 && <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No departments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
