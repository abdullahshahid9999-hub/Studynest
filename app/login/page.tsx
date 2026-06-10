'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push('/admin');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '400px', border: '1px solid #e2e8f0' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px', textAlign: 'center' }}>Admin Login</h1>
        <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>NTU Past Papers Archive</p>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '10px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
