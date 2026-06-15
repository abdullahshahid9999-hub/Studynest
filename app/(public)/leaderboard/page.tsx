"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://dvtkcuqwvkakycsseydh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70"
);

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sb.from("v_leaderboard").select("*").limit(100).then(({ data }) => {
      setEntries(data ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = entries.filter(e =>
    e.roll_number?.toLowerCase().includes(search.toLowerCase())
  );

  const openProfile = async (roll: string) => {
    const [{ data: c }, { data: papers }] = await Promise.all([
      sb.from("contributors").select("*, departments(name,code)").eq("roll_number", roll).single(),
      sb.from("papers")
        .select("exam_type,semester,term,year,status,subjects(name,course_code),teachers(name)")
        .eq("roll_number", roll).order("created_at", { ascending: false }),
    ]);
    setProfile({ c, papers: papers ?? [] });
  };

  const rankDisplay = (rank: number) => {
    if (rank === 1) return { icon: "1st", bg: "#fef3c7", color: "#b45309" };
    if (rank === 2) return { icon: "2nd", bg: "#f1f5f9", color: "#64748b" };
    if (rank === 3) return { icon: "3rd", bg: "#fef0e7", color: "#c2622d" };
    return { icon: `#${rank}`, bg: "transparent", color: "#bbb" };
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 4 }}>Leaderboard</h1>
        <p style={{ fontSize: 14, color: "#888" }}>
          {entries.length} contributors ranked by approved papers
        </p>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>Top Contributors</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search roll number…"
            style={{ padding: "7px 12px", border: "1px solid #e0e0e0", borderRadius: 7, fontSize: 13, outline: "none", width: 210 }}
          />
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#bbb", fontSize: 14 }}>Loading…</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                {["Rank", "Roll Number", "Dept", "Approved", ""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const r = rankDisplay(Number(e.rank));
                return (
                  <tr key={e.id} style={{ borderBottom: "1px solid #f7f7f7" }}
                    onMouseEnter={ev => (ev.currentTarget.style.background = "#fafafa")}
                    onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: r.bg, color: r.color }}>
                        {r.icon}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px", fontFamily: "monospace", fontWeight: 600, fontSize: 13, color: "#111" }}>{e.roll_number}</td>
                    <td style={{ padding: "13px 16px" }}>
                      {e.department_code && (
                        <span style={{ background: "#eef2ff", color: "#3b5bdb", padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700 }}>
                          {e.department_code}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "13px 16px", fontWeight: 800, fontSize: 18, color: "#059669" }}>{e.total_approved}</td>
                    <td style={{ padding: "13px 16px", textAlign: "right" }}>
                      <button onClick={() => openProfile(e.roll_number)} style={{
                        padding: "5px 14px", background: "transparent", border: "1px solid #e0e0e0",
                        borderRadius: 6, cursor: "pointer", fontSize: 12, color: "#555", fontWeight: 500,
                      }}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 48, textAlign: "center", color: "#bbb", fontSize: 14 }}>
                    {search ? "No result found." : "No contributors yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Profile modal */}
      {profile && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setProfile(null)}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 500, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 17, color: "#111", marginBottom: 3 }}>{profile.c?.roll_number}</div>
                <div style={{ fontSize: 13, color: "#888" }}>{profile.c?.departments?.name ?? "—"}</div>
              </div>
              <button onClick={() => setProfile(null)} style={{ background: "#f5f5f5", border: "none", borderRadius: 7, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 24 }}>
              {[
                { l: "Approved", v: profile.c?.total_approved, c: "#059669", bg: "#f0fdf4" },
                { l: "Pending", v: profile.c?.total_pending, c: "#d97706", bg: "#fffbeb" },
                { l: "Rejected", v: profile.c?.total_rejected, c: "#dc2626", bg: "#fef2f2" },
              ].map(({ l, v, c, bg }) => (
                <div key={l} style={{ background: bg, borderRadius: 10, padding: "16px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: c, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{l}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: c }}>{v ?? 0}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Upload History</div>
            <div style={{ border: "1px solid #e8e8e8", borderRadius: 8, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    {["Subject", "Exam", "Term", "Status"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#bbb", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {profile.papers.map((p: any, i: number) => (
                    <tr key={i} style={{ borderTop: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "9px 12px" }}>
                        <div style={{ fontWeight: 500, color: "#111" }}>{p.subjects?.name}</div>
                        <div style={{ fontSize: 11, color: "#bbb", fontFamily: "monospace" }}>{p.subjects?.course_code}</div>
                      </td>
                      <td style={{ padding: "9px 12px", color: "#666" }}>{p.exam_type}</td>
                      <td style={{ padding: "9px 12px", color: "#666" }}>{p.term} {p.year}</td>
                      <td style={{ padding: "9px 12px" }}>
                        <span style={{
                          padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                          background: p.status === "Approved" ? "#d1fae5" : p.status === "Pending" ? "#fef3c7" : "#fee2e2",
                          color: p.status === "Approved" ? "#065f46" : p.status === "Pending" ? "#92400e" : "#991b1b",
                        }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!profile.papers.length && (
                    <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#bbb" }}>No papers yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
