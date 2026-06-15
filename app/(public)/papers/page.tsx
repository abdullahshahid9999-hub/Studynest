"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://dvtkcuqwvkakycsseydh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTA3NzA4NywiZXhwIjoyMDk2NjUzMDg3fQ.PQjFQe3RfawULpWVa9jBPAKi4ND2AiRb1ChWgIO6O3Q"
);

const DEPT_MAP: Record<string, string> = {
  CS: "Computer Science", TE: "Textile Engineering", ME: "Mechanical Engineering",
  MS: "Management Sciences", EE: "Electrical Engineering", CHE: "Chemical Engineering", ENV: "Environmental Sciences",
};

function parseRoll(roll: string) {
  const m = roll.trim().toUpperCase().match(/^\d{2}-NTU-([A-Z]+)-[A-Z]+-\d{4,6}$/);
  return m ? { code: m[1], name: DEPT_MAP[m[1]] ?? m[1] } : null;
}

const inp: React.CSSProperties = {
  padding: "10px 14px", border: "1px solid #e0e0e0", borderRadius: 8,
  fontSize: 14, width: "100%", boxSizing: "border-box", outline: "none", color: "#111",
};

export default function PapersPage() {
  const [roll, setRoll] = useState("");
  const [dept, setDept] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [viewer, setViewer] = useState<{ url: string; paper: any } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const handleRoll = async () => {
    const parsed = parseRoll(roll);
    if (!parsed) return;
    setDept(parsed);
    setTeacherId(""); setSubjectId(""); setPapers([]); setSearched(false);
    const { data: dRow } = await sb.from("departments").select("id").eq("code", parsed.code).eq("is_active", true).single();
    if (!dRow) return;
    const { data: t } = await sb.from("teachers").select("id,name").eq("department_id", dRow.id).eq("is_active", true).order("name");
    setTeachers(t ?? []);
    setStep(2);
  };

  const handleTeacher = async (tid: string, tname: string) => {
    setTeacherId(tid); setTeacherName(tname);
    setSubjectId(""); setPapers([]); setSearched(false);
    const { data: s } = await sb.from("subjects").select("id,name,course_code").eq("teacher_id", tid).eq("is_active", true).order("name");
    setSubjects(s ?? []);
    setStep(3);
  };

  const handleSubject = async (sid: string, sname: string) => {
    setSubjectId(sid); setSubjectName(sname);
    setLoading(true); setSearched(true);
    const { data } = await sb.from("papers")
      .select("id,exam_type,semester,term,year,file_type,subjects(name,course_code),teachers(name)")
      .eq("status", "Approved").eq("subject_id", sid)
      .order("year", { ascending: false });
    setPapers(data ?? []);
    setLoading(false);
    setStep(4);
  };

  const reset = () => {
    setRoll(""); setDept(null); setTeachers([]); setTeacherId(""); setTeacherName("");
    setSubjects([]); setSubjectId(""); setSubjectName(""); setPapers([]); setSearched(false); setStep(1);
  };

  const handleView = async (paper: any) => {
    setBusy(paper.id);
    try {
      const res = await fetch(`/api/papers/signed?id=${paper.id}`);
      const json = await res.json();
      if (json.url) setViewer({ url: json.url, paper });
      else alert("File load nahi hua. Admin se contact karo.");
    } catch { alert("Network error."); }
    setBusy(null);
  };

  const handleDownload = (paper: any) => {
    const a = document.createElement("a");
    a.href = `/api/papers/signed?id=${paper.id}&action=download`;
    a.target = "_blank"; a.rel = "noopener noreferrer";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const steps = [["1", "Roll Number"], ["2", "Teacher"], ["3", "Subject"], ["4", "Papers"]];

  return (
    <div style={{ maxWidth: 920 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 4 }}>Past Papers</h1>
        <p style={{ fontSize: 14, color: "#888" }}>Enter your roll number to browse papers for your department.</p>
      </div>

      {/* Steps */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
        {steps.map(([num, label], i) => {
          const n = parseInt(num); const active = step === n; const done = step > n;
          return (
            <div key={num} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0,
                  background: done ? "#059669" : active ? "#111" : "#e8e8e8",
                  color: done || active ? "#fff" : "#999",
                }}>
                  {done ? "✓" : num}
                </div>
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#111" : done ? "#059669" : "#bbb" }}>{label}</span>
              </div>
              {i < 3 && <div style={{ width: 24, height: 1, background: "#e0e0e0" }} />}
            </div>
          );
        })}
        {step > 1 && (
          <button onClick={reset} style={{ marginLeft: "auto", padding: "5px 14px", border: "1px solid #e0e0e0", borderRadius: 6, fontSize: 12, color: "#888", background: "#fff", cursor: "pointer" }}>
            Start Over
          </button>
        )}
      </div>

      {/* Step 1 */}
      <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: 20, marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.06em", marginBottom: 8, textTransform: "uppercase" }}>Roll Number</label>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={roll} onChange={e => setRoll(e.target.value)}
            onKeyDown={e => e.key === "Enter" && parseRoll(roll) && handleRoll()}
            placeholder="25-NTU-CS-FL-1124" style={inp}
            onFocus={e => (e.target.style.borderColor = "#111")}
            onBlur={e => (e.target.style.borderColor = "#e0e0e0")} />
          <button onClick={handleRoll} disabled={!parseRoll(roll)} style={{
            padding: "10px 22px", background: parseRoll(roll) ? "#111" : "#e8e8e8",
            color: parseRoll(roll) ? "#fff" : "#bbb", border: "none", borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: parseRoll(roll) ? "pointer" : "not-allowed", flexShrink: 0,
          }}>
            Search
          </button>
        </div>
        {dept && <p style={{ fontSize: 12, color: "#059669", marginTop: 8, fontWeight: 600 }}>✓ {dept.code} — {dept.name}</p>}
        {roll.length > 8 && !parseRoll(roll) && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 8 }}>Invalid format. Example: 25-NTU-CS-FL-1124</p>}
      </div>

      {/* Step 2 */}
      {step >= 2 && (
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: 20, marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.06em", marginBottom: 14, textTransform: "uppercase" }}>Select Teacher</label>
          {teachers.length === 0 ? (
            <p style={{ fontSize: 13, color: "#bbb" }}>No teachers found for your department.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {teachers.map(t => (
                <button key={t.id} onClick={() => handleTeacher(t.id, t.name)} style={{
                  padding: "9px 18px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                  fontWeight: teacherId === t.id ? 700 : 400,
                  background: teacherId === t.id ? "#111" : "#fafafa",
                  color: teacherId === t.id ? "#fff" : "#333",
                  border: teacherId === t.id ? "1.5px solid #111" : "1px solid #e0e0e0",
                }}>
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3 */}
      {step >= 3 && (
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: 20, marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.06em", marginBottom: 14, textTransform: "uppercase" }}>Select Subject</label>
          {subjects.length === 0 ? (
            <p style={{ fontSize: 13, color: "#bbb" }}>No subjects found.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {subjects.map(s => (
                <button key={s.id} onClick={() => handleSubject(s.id, s.name)} style={{
                  padding: "9px 18px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                  fontWeight: subjectId === s.id ? 700 : 400,
                  background: subjectId === s.id ? "#111" : "#fafafa",
                  color: subjectId === s.id ? "#fff" : "#333",
                  border: subjectId === s.id ? "1.5px solid #111" : "1px solid #e0e0e0",
                }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, opacity: 0.5, marginRight: 6 }}>{s.course_code}</span>
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4 */}
      {searched && (
        loading ? (
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: 40, textAlign: "center", color: "#bbb", fontSize: 14 }}>
            Loading papers…
          </div>
        ) : papers.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: "56px 20px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 22 }}>
              📭
            </div>
            <p style={{ fontWeight: 600, color: "#333", marginBottom: 6 }}>No papers yet</p>
            <p style={{ fontSize: 13, color: "#aaa" }}>No approved papers for <b>{subjectName}</b>. Be the first to contribute!</p>
            <a href="/contribute" style={{ display: "inline-block", marginTop: 16, padding: "9px 20px", background: "#111", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              Contribute a Paper
            </a>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "#777", marginBottom: 14 }}>
              <b style={{ color: "#111" }}>{papers.length}</b> paper{papers.length !== 1 ? "s" : ""} found for <b style={{ color: "#111" }}>{subjectName}</b>
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
              {papers.map((p: any) => (
                <div key={p.id} style={{
                  background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12,
                  padding: 20, display: "flex", flexDirection: "column",
                }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; el.style.borderColor = "#d0d0d0"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = "none"; el.style.borderColor = "#e8e8e8"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#111", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.subjects?.name}</div>
                      <div style={{ fontSize: 11, color: "#bbb", fontFamily: "monospace" }}>{p.subjects?.course_code}</div>
                    </div>
                    <span style={{
                      padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 8,
                      background: p.exam_type === "Final" ? "#e8f0fe" : "#fef9e7",
                      color: p.exam_type === "Final" ? "#1a56db" : "#92400e",
                    }}>
                      {p.exam_type}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 16, flex: 1 }}>
                    Semester {p.semester} &middot; {p.term} {p.year}
                  </div>
                  <div style={{ display: "flex", gap: 8, paddingTop: 14, borderTop: "1px solid #f5f5f5" }}>
                    <button onClick={() => handleView(p)} disabled={busy === p.id} style={{
                      flex: 1, padding: "8px", background: busy === p.id ? "#555" : "#111",
                      color: "#fff", border: "none", borderRadius: 7, cursor: busy === p.id ? "not-allowed" : "pointer",
                      fontSize: 13, fontWeight: 600,
                    }}>
                      {busy === p.id ? "Loading…" : "View"}
                    </button>
                    <button onClick={() => handleDownload(p)} style={{
                      flex: 1, padding: "8px", background: "#fafafa",
                      color: "#444", border: "1px solid #e0e0e0", borderRadius: 7,
                      cursor: "pointer", fontSize: 13, fontWeight: 600,
                    }}>
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      )}

      {/* Fullscreen Viewer */}
      {viewer && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#1a1a1a", display: "flex", flexDirection: "column" }}>
          <div style={{
            background: "#fff", padding: "10px 16px", display: "flex",
            justifyContent: "space-between", alignItems: "center",
            flexShrink: 0, borderBottom: "1px solid #e8e8e8", gap: 12,
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {viewer.paper.subjects?.name}
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>
                {viewer.paper.subjects?.course_code} &middot; {viewer.paper.exam_type} &middot; Sem {viewer.paper.semester} &middot; {viewer.paper.term} {viewer.paper.year}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => handleDownload(viewer.paper)} style={{
                padding: "7px 16px", background: "#111", color: "#fff",
                border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
                Download
              </button>
              <button onClick={() => setViewer(null)} style={{
                width: 34, height: 34, background: "#f5f5f5", border: "1px solid #e0e0e0",
                borderRadius: 7, fontSize: 18, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                ✕
              </button>
            </div>
          </div>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            {viewer.paper.file_type?.includes("image") ? (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", overflow: "auto" }}>
                <img src={viewer.url} alt="Paper" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
            ) : (
              <iframe src={viewer.url} style={{ width: "100%", height: "100%", border: "none" }} title="Paper Viewer" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
