"use client";
import { useState } from "react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleTruncate() {
    if (!confirm("Sab data delete ho jayega. Confirm?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/truncate", { method: "POST" });
      const data = await res.json();
      if (data.success) setDone(true);
      else setError(data.error || "Error hua");
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: "40px", fontFamily: "Inter, sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "32px", color: "#111" }}>
        Admin Dashboard
      </h1>

      <div style={{
        background: "#fff",
        border: "1px solid #e8e8e8",
        borderRadius: "12px",
        padding: "32px",
        maxWidth: "500px"
      }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#111", marginBottom: "8px" }}>
          Danger Zone
        </h2>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
          Yeh action sab departments, teachers, subjects, papers aur contributors delete kar dega. Auth account safe rahega.
        </p>

        {done && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: "8px", padding: "12px 16px",
            color: "#166534", fontSize: "14px", marginBottom: "16px"
          }}>
            ✓ Sab data successfully delete ho gaya!
          </div>
        )}

        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: "8px", padding: "12px 16px",
            color: "#991b1b", fontSize: "14px", marginBottom: "16px"
          }}>
            Error: {error}
          </div>
        )}

        <button
          onClick={handleTruncate}
          disabled={loading || done}
          style={{
            background: done ? "#e5e7eb" : "#dc2626",
            color: done ? "#9ca3af" : "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: loading || done ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Deleting..." : done ? "Done" : "Sab Data Delete Karo"}
        </button>
      </div>
    </div>
  );
}
