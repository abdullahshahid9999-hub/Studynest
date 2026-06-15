"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  "https://dvtkcuqwvkakycsseydh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dGtjdXF3dmtha3ljc3NleWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzcwODcsImV4cCI6MjA5NjY1MzA4N30.pLMH2yo3TVlBteHo-ec_T_ENH0WktwXCDmPirGRAf70"
);

const DEPTS: Record<string, string> = {
  CS: "Computer Science", TE: "Textile Engineering", ME: "Mechanical Engineering",
  MS: "Management Sciences", EE: "Electrical Engineering", CHE: "Chemical Engineering", ENV: "Environmental Sciences",
};

function parseDept(roll: string) {
  const m = roll.trim().toUpperCase().match(/^\d{2}-NTU-([A-Z]+)-[A-Z]+-\d{4,6}$/);
  return m ? { code: m[1], name: DEPTS[m[1]] ?? m[1] } : null;
}

export default function ContributePage() {
  const [roll, setRoll] = useState("");
  const [dept, setDept] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examType, setExamType] = useState("");
  const [semester, setSemester] = useState("");
  const [term, setTerm] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [file, setFile] = useState<File | null>(null);
  const [fileErr, setFileErr] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const p = parseDept(roll);
    if (!p) { setDept(null); setTeachers([]); setTeacherId(""); setSubjects([]); setSubjectId(""); return; }
    setDept(p);
    sb.from("departments").select("id").eq("code", p.code).eq("is_active", true).single()
      .then(({ data: d }) => {
        if (!d) return;
        sb.from("teachers").select("id,name").eq("department_id", d.id).eq("is_active", true).order("name")
          .then(({ data }) => { setTeachers(data ?? []); setTeacherId(""); setSubjects([]); setSubjectId(""); });
      });
  }, [roll]);

  useEffect(() => {
    if (!teacherId) { setSubjects([]); setSubjectId(""); return; }
    sb.from("subjects").select("id,name,course_code").eq("teacher_id", teacherId).eq("is_active", true).order("name")
      .then(({ data }) => { setSubjects(data ?? []); setSubjectId(""); });
  }, [teacherId]);

  const handleFile = (f: File | null) => {
    setFileErr("");
    if (!f) return;
    const ok = ["application/pdf", "image/jpeg", "image/jpg", "image/png",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!ok.includes(f.type)) { setFileErr("Sirf PDF, JPG, PNG, ya DOCX allowed hai"); return; }
    if (f.size > 20 * 1024 * 1024) { setFileErr("Max 20MB allowed hai"); return; }
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setFileErr("File select karo"); return; }
    setStatus("loading");
    const fd = new FormData();
    fd.append("roll_number", roll.trim().toUpperCase());
    fd.append("teacher_id", teacherId); fd.append("subject_id", subjectId);
    fd.append("exam_type", examType); fd.append("semester", semester);
    fd.append("term", term); fd.append("year", String(year));
    fd.append("file", file); fd.append("recaptcha_token", "bypass");
    const res = await fetch("/api/contribute", { method: "POST", body: fd });
    const json = await res.json();
    if (json.success) { setStatus("success"); setMsg(json.message); }
    else { setStatus("error"); setMsg(json.error); }
  };

  const sel: React.CSSProperties = {
    width: "100%", padding: "11px 14px", border: "1.5px solid #e0e0e0",
    borderRadius: 9, fontSize: 14, color: "#111", background: "#fff",
    outline: "none", cursor: "pointer", fontFamily: "inherit",
    transition: "border-color 0.17s",
    appearance: "auto" as any,
  };

  const CY = new Date().getFullYear();
  const YEARS = Array.from({ length: 10 }, (_, i) => CY - i);

  if (status === "success") return (
    <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", animation: "fadeUp 0.5s ease" }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "linear-gradient(135deg, #10b981, #059669)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px", fontSize: 36, color: "#fff",
        boxShadow: "0 8px 24px rgba(5,150,105,0.3)",
        animation: "pulse 0.5s ease",
      }}>
        ✓
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 10 }}>Paper Submit Ho Gaya!</h2>
      <p style={{ color: "#777", marginBottom: 28, lineHeight: 1.7, fontSize: 14 }}>{msg}</p>
      <button onClick={() => { setStatus("idle"); setRoll(""); setFile(null); setTeacherId(""); setSubjectId(""); setExamType(""); setSemester(""); setTerm(""); }}
        className="btn-primary" style={{ padding: "11px 28px" }}>
        Aur Submit Karo
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 640 }}>

      {/* Hero */}
      <div className="fade-up" style={{
        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        borderRadius: 20, padding: "36px", marginBottom: 28, color: "#fff",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.4px" }}>Contribute a Paper</h1>
        <p style={{ fontSize: 14, opacity: 0.9 }}>NTU students ki madad karo. Admin review ke baad paper live ho jaega.</p>
      </div>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Roll Number */}
        <div className="section-card fade-up-1">
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", marginBottom: 10, textTransform: "uppercase" }}>Roll Number</label>
          <input value={roll} onChange={e => setRoll(e.target.value)} placeholder="25-NTU-CS-FL-1124" required className="input-field" />
          {dept && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "#d1fae5", color: "#065f46", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>✓ {dept.code}</span>
              <span style={{ fontSize: 13, color: "#059669", fontWeight: 500 }}>{dept.name}</span>
            </div>
          )}
          {roll.length > 8 && !dept && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 8 }}>Format galat hai. Sahi: 25-NTU-CS-FL-1124</p>}
        </div>

        {/* Paper Info */}
        <div className="section-card fade-up-2">
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", marginBottom: 16, textTransform: "uppercase" }}>Paper Details</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Teacher <span style={{ color: "#e02424" }}>*</span></label>
              <select value={teacherId} onChange={e => setTeacherId(e.target.value)} required disabled={!dept} style={{ ...sel, opacity: dept ? 1 : 0.5 }}>
                <option value="">{!dept ? "Pehle roll number daalo" : teachers.length === 0 ? "Koi teacher nahi mila" : "Teacher chunno"}</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Subject <span style={{ color: "#e02424" }}>*</span></label>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required disabled={!teacherId} style={{ ...sel, opacity: teacherId ? 1 : 0.5 }}>
                <option value="">{!teacherId ? "Pehle teacher chunno" : "Subject chunno"}</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.course_code} — {s.name}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "Exam Type", val: examType, set: setExamType, opts: [["Mid","Mid Term"],["Final","Final Term"]] },
                { label: "Semester", val: semester, set: setSemester, opts: ["1","2","3","4","5","6","7","8"].map(s => [s, `Sem ${s}`]) },
                { label: "Term", val: term, set: setTerm, opts: [["Spring","Spring"],["Fall","Fall"]] },
                { label: "Year", val: String(year), set: (v: string) => setYear(parseInt(v)), opts: YEARS.map(y => [String(y), String(y)]) },
              ].map(({ label, val, set, opts }) => (
                <div key={label}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>{label} <span style={{ color: "#e02424" }}>*</span></label>
                  <select value={val} onChange={e => (set as any)(e.target.value)} required style={sel}>
                    <option value="">Chunno</option>
                    {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="section-card fade-up-3">
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", marginBottom: 12, textTransform: "uppercase" }}>File Upload</label>
          <div
            className={`upload-zone ${file ? "has-file" : ""} ${dragOver ? "drag" : ""}`}
            onClick={() => document.getElementById("fi")?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0] ?? null); }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>{file ? "📄" : "⬆"}</div>
            {file ? (
              <>
                <p style={{ fontWeight: 700, color: "#059669", fontSize: 14, marginBottom: 4 }}>{file.name}</p>
                <p style={{ fontSize: 12, color: "#777" }}>{(file.size / 1024 / 1024).toFixed(1)} MB · Click ya drag to change</p>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 600, color: "#444", fontSize: 14, marginBottom: 4 }}>Click karo ya file drag karo</p>
                <p style={{ fontSize: 12, color: "#aaa" }}>PDF, JPG, PNG, DOCX · Max 20MB</p>
              </>
            )}
            <input id="fi" type="file" accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={e => handleFile(e.target.files?.[0] ?? null)} style={{ display: "none" }} />
          </div>
          {fileErr && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 8, fontWeight: 500 }}>{fileErr}</p>}
        </div>

        {status === "error" && msg && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", color: "#dc2626", fontSize: 13, fontWeight: 500 }}>
            {msg}
          </div>
        )}

        <button type="submit" disabled={status === "loading"} className="submit-btn" style={{ animation: "fadeUp 0.5s 0.3s ease both" }}>
          {status === "loading" ? "Submit ho raha hai…" : "Paper Submit Karo"}
        </button>
      </form>
    </div>
  );
}
