import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #e8e8e8',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          padding: '0 24px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
        }}>
          <Link href="/papers" style={{
            fontWeight: 700, fontSize: 16, color: '#111', letterSpacing: '-0.3px'
          }}>
            NTU Past Papers
          </Link>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              ['/papers', 'Papers'],
              ['/contribute', 'Contribute'],
              ['/leaderboard', 'Leaderboard'],
            ].map(([href, label]) => (
              <Link key={href} href={href} style={{
                padding: '6px 14px',
                borderRadius: 7,
                fontSize: 14,
                fontWeight: 500,
                color: '#444',
                transition: 'background 0.15s',
              }}
                onMouseEnter={undefined}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>

      <footer style={{
        borderTop: '1px solid #e8e8e8',
        background: '#fff',
        padding: '20px 24px',
        marginTop: 60,
        textAlign: 'center',
        fontSize: 13,
        color: '#999',
      }}>
        NTU Past Papers Archive · For students, by students
      </footer>
    </div>
  );
}
