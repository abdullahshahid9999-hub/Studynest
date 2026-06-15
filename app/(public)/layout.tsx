"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <nav style={{
        background: "#fff",
        borderBottom: "1px solid #e8e8e8",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", height: 56,
        }}>
          <Link href="/papers" style={{ fontWeight: 800, fontSize: 15, color: "#111", letterSpacing: "-0.4px", textDecoration: "none" }}>
            StudyNest <span style={{ fontWeight: 400, color: "#aaa", fontSize: 13 }}>· NTU</span>
          </Link>
          <div style={{ display: "flex", gap: 4 }}>
            {([
              ["/papers", "Papers"],
              ["/contribute", "Contribute"],
              ["/leaderboard", "Leaderboard"],
            ] as [string, string][]).map(([href, label]) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href} style={{
                  padding: "6px 14px", borderRadius: 7, fontSize: 14, fontWeight: 500,
                  color: active ? "#111" : "#666",
                  background: active ? "#f0f0f0" : "transparent",
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                }}>
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px" }}>
        {children}
      </main>

      <footer style={{
        borderTop: "1px solid #e8e8e8", background: "#fff",
        padding: "20px 24px", marginTop: 60,
        textAlign: "center", fontSize: 13, color: "#bbb",
      }}>
        StudyNest &mdash; NTU Past Papers Archive &middot; For students, by students
      </footer>
    </div>
  );
}
