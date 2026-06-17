'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://dvtkcuqwvkakycsseydh.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q', { auth: { persistSession: false, autoRefreshToken: false } });

interface LinkRow { label: string; url: string; }

const EMPTY = {
  name: '', role: 'Admin', info: '', quote: '',
  avatar_url: '', linkedin_url: '', github_url: '',
  links: [] as LinkRow[], display_order: 0, is_active: true,
};

export default function TeamManagementPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await sb.from('team_members').select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });
    setMembers(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: '', ok: true }), 2800);
  };

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const addLink = () => setForm(f => ({ ...f, links: [...f.links, { label: '', url: '' }] }));
  const updLink = (i: number, k: keyof LinkRow, v: string) =>
    setForm(f => ({ ...f, links: f.links.map((l, idx) => idx === i ? { ...l, [k]: v } : l) }));
  const delLink = (i: number) =>
    setForm(f => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }));

  const resetForm = () => { setForm({ ...EMPTY }); setEditId(null); };

  const save = async () => {
    if (!form.name.trim()) { flash('Name is required.', false); return; }
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      role: form.role.trim() || null,
      info: form.info.trim() || null,
      quote: form.quote.trim() || null,
      avatar_url: form.avatar_url.trim() || null,
      linkedin_url: form.linkedin_url.trim() || null,
      github_url: form.github_url.trim() || null,
      links: form.links
        .map(l => ({ label: l.label.trim(), url: l.url.trim() }))
        .filter(l => l.url),
      display_order: Number(form.display_order) || 0,
      is_active: form.is_active,
    };

    if (editId) {
      const { error } = await sb.from('team_members').update(payload).eq('id', editId);
      if (error) { flash(error.message, false); } else { flash('Updated!'); resetForm(); await load(); }
    } else {
      const { error } = await sb.from('team_members').insert(payload);
      if (error) { flash(error.message, false); } else { flash('Member added!'); resetForm(); await load(); }
    }
    setLoading(false);
  };

  const edit = (m: any) => {
    setEditId(m.id);
    setForm({
      name: m.name ?? '', role: m.role ?? '', info: m.info ?? '', quote: m.quote ?? '',
      avatar_url: m.avatar_url ?? '', linkedin_url: m.linkedin_url ?? '', github_url: m.github_url ?? '',
      links: Array.isArray(m.links) ? m.links.map((l: any) => ({ label: l.label ?? '', url: l.url ?? '' })) : [],
      display_order: m.display_order ?? 0, is_active: m.is_active ?? true,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleActive = async (m: any) => {
    await sb.from('team_members').update({ is_active: !m.is_active }).eq('id', m.id);
    await load();
  };

  const del = async (id: string) => {
    if (!confirm('Remove this member? This will also remove them from the public About Us page.')) return;
    const { error } = await sb.from('team_members').delete().eq('id', id);
    if (error) flash(error.message, false);
    else { flash('Member removed.'); if (editId === id) resetForm(); await load(); }
  };

  const inp: React.CSSProperties = { padding: '9px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box', outline: 'none', color: '#111', fontFamily: 'inherit' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 };
  const focus = (e: any) => (e.target.style.borderColor = '#111');
  const blur = (e: any) => (e.target.style.borderColor = '#e0e0e0');

  return (
    <div style={{ maxWidth: 860 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 4 }}>Admin Management</h1>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
        Manage the people behind StudyNest. Active members are shown read-only on the public
        <a href="/about" target="_blank" style={{ color: '#3b5bdb', textDecoration: 'none', fontWeight: 600 }}> About&nbsp;Us</a> page.
      </p>

      {/* Form */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 22, marginBottom: 22 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 16 }}>
          {editId ? 'Edit Member' : 'Add Member'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={lbl}>Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ali Khan" style={inp} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={lbl}>Role / Title</label>
            <input value={form.role} onChange={e => set('role', e.target.value)} placeholder="Admin" style={inp} onFocus={focus} onBlur={blur} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Info / Bio</label>
          <textarea value={form.info} onChange={e => set('info', e.target.value)} placeholder="A short paragraph about this person…" rows={3} style={{ ...inp, resize: 'vertical' }} onFocus={focus} onBlur={blur} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Quote</label>
          <textarea value={form.quote} onChange={e => set('quote', e.target.value)} placeholder='"Code is poetry."' rows={2} style={{ ...inp, resize: 'vertical' }} onFocus={focus} onBlur={blur} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={lbl}>LinkedIn URL</label>
            <input value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/…" style={inp} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={lbl}>GitHub URL</label>
            <input value={form.github_url} onChange={e => set('github_url', e.target.value)} placeholder="https://github.com/…" style={inp} onFocus={focus} onBlur={blur} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Avatar / Photo URL</label>
          <input value={form.avatar_url} onChange={e => set('avatar_url', e.target.value)} placeholder="https://… (optional — leave blank to use initials)" style={inp} onFocus={focus} onBlur={blur} />
        </div>

        {/* Extra links */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ ...lbl, marginBottom: 0 }}>Other Links</label>
            <button type="button" onClick={addLink} style={{ padding: '4px 12px', background: '#f0f4ff', color: '#3b5bdb', border: '1px solid #dbe4ff', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>+ Add link</button>
          </div>
          {form.links.length === 0 && <p style={{ fontSize: 12, color: '#bbb' }}>No extra links. Add a portfolio, Twitter/X, website, etc.</p>}
          {form.links.map((l, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, marginBottom: 8 }}>
              <input value={l.label} onChange={e => updLink(i, 'label', e.target.value)} placeholder="Label (e.g. Portfolio)" style={inp} onFocus={focus} onBlur={blur} />
              <input value={l.url} onChange={e => updLink(i, 'url', e.target.value)} placeholder="https://…" style={inp} onFocus={focus} onBlur={blur} />
              <button type="button" onClick={() => delLink(i)} style={{ padding: '0 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>✕</button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 14 }}>
          <div style={{ width: 130 }}>
            <label style={lbl}>Display Order</label>
            <input type="number" value={form.display_order} onChange={e => set('display_order', e.target.value)} style={inp} onFocus={focus} onBlur={blur} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444', cursor: 'pointer', marginTop: 18 }}>
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
            Visible on public site
          </label>
        </div>

        {msg.text && <p style={{ fontSize: 13, color: msg.ok ? '#059669' : '#dc2626', marginBottom: 12, fontWeight: 500 }}>{msg.text}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save} disabled={loading}
            style={{ padding: '9px 22px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: loading ? 'default' : 'pointer', fontSize: 13, fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving…' : editId ? 'Update Member' : 'Add Member'}
          </button>
          {editId && (
            <button onClick={resetForm}
              style={{ padding: '9px 16px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#555', fontWeight: 600 }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0f0', fontSize: 14, fontWeight: 700, color: '#111' }}>
          Team Members ({members.length})
        </div>
        {members.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#aaa', fontSize: 14 }}>No members yet. Add the first one above.</div>
        ) : members.map((m, i) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < members.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, background: m.avatar_url ? `center/cover no-repeat url(${m.avatar_url})` : 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
              {!m.avatar_url && (m.name?.[0]?.toUpperCase() ?? '?')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#111' }}>{m.name}</span>
                {!m.is_active && <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', background: '#fef2f2', padding: '2px 7px', borderRadius: 5 }}>HIDDEN</span>}
              </div>
              <div style={{ fontSize: 12, color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {m.role || '—'}{m.linkedin_url ? ' · LinkedIn' : ''}{m.github_url ? ' · GitHub' : ''}{Array.isArray(m.links) && m.links.length ? ` · +${m.links.length} link${m.links.length > 1 ? 's' : ''}` : ''}
              </div>
            </div>
            <span style={{ fontSize: 11, color: '#bbb', flexShrink: 0 }}>#{m.display_order}</span>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button onClick={() => toggleActive(m)} style={{ padding: '5px 11px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>{m.is_active ? 'Hide' : 'Show'}</button>
              <button onClick={() => edit(m)} style={{ padding: '5px 12px', background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Edit</button>
              <button onClick={() => del(m.id)} style={{ padding: '5px 12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
