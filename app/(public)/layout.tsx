import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header style={{
        background: '#1a56db', color: 'white',
        boxShadow: '0 2px 8px rgba(26,86,219,0.3)'
      }}>
        {/* Top bar */}
        <div style={{ background: '#1e429f', padding: '6px 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>National Textile University — Past Papers Archive</span>
            <Link href="/login" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>Admin Portal</Link>
          </div>
        </div>
        {/* Main nav */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <Link href="/papers" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📚</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '16px', color: 'white', lineHeight: 1.2 }}>StudyNest</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>NTU Past Papers</div>
            </div>
          </Link>
          <nav style={{ display: 'flex', gap: '4px' }}>
            {[
              { href: '/papers', label: 'Past Papers', icon: '📄' },
              { href: '/contribute', label: 'Contribute', icon: '⬆️' },
              { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
            ].map(({ href, label, icon }) => (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
                color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500',
                background: 'rgba(255,255,255,0.1)',
              }}>
                <span style={{ fontSize: '14px' }}>{icon}</span>{label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer style={{ background: '#1e429f', color: 'white', padding: '32px 24px', marginTop: '60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>StudyNest — NTU Past Papers Archive</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>Helping NTU students succeed since 2024</div>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {[['Past Papers', '/papers'], ['Contribute', '/contribute'], ['Leaderboard', '/leaderboard']].map(([l, h]) => (
              <Link key={h} href={h} style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '13px' }}>{l}</Link>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '16px auto 0', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.15)', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
          © {new Date().getFullYear()} StudyNest. For NTU students only.
        </div>
      </footer>
    </div>
  );
}
