'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dvtkcuqwvkakycsseydh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70'
);

export default function LoginPage() {
  const [email, setEmail] = useState('admin@ntu.edu.pk');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDebug('Attempting login...');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      setDebug('Response received: ' + JSON.stringify({ 
        hasSession: !!data?.session, 
        hasUser: !!data?.user,
        error: authError?.message 
      }));

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data?.session) {
        setDebug('Login success! Redirecting...');
        window.location.href = '/admin';
      } else {
        setError('No session returned. Check email confirmation in Supabase.');
        setLoading(false);
      }
    } catch (err: any) {
      setError('Network error: ' + err.message);
      setDebug('Exception: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '48px 40px',
        width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📚</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0 0 4px', color: '#0f172a' }}>Admin Login</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>NTU Past Papers Archive</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' as const }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              autoComplete="current-password"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' as const }} />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#dc2626', fontSize: '13px' }}>
              ⚠️ {error}
            </div>
          )}

          {debug && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px', marginBottom: '16px', color: '#166534', fontSize: '11px', fontFamily: 'monospace', wordBreak: 'break-all' as const }}>
              {debug}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px', background: loading ? '#94a3b8' : '#1d4ed8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
