import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <Link href="/" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a', textDecoration: 'none' }}>
            📚 NTU Past Papers
          </Link>
          <div style={{ display: 'flex', gap: '24px' }}>
            {[['Papers', '/papers'], ['Contribute', '/contribute'], ['Leaderboard', '/leaderboard']].map(([label, href]) => (
              <Link key={href} href={href} style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{label}</Link>
            ))}
          </div>
        </div>
      </nav>
      <main>{children}</main>
      <footer style={{ background: 'white', borderTop: '1px solid #e2e8f0', padding: '20px 24px', textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: '60px' }}>
        © {new Date().getFullYear()} NTU Past Papers Archive. All rights reserved.
      </footer>
    </div>
  );
}
