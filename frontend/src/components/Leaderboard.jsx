// frontend/src/components/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import { fetchLeaderboard } from "../api";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchLeaderboard()
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) setRows(data);
        else setRows([]);
      })
      .catch((e) => {
        console.error("Leaderboard fetch error", e);
        setRows([]);
      })
      .finally(() => setLoading(false));
    return () => (mounted = false);
  }, []);

  if (loading) return <div>Loading leaderboard…</div>;
  if (!rows || rows.length === 0) return <div>No activity in last 24 hours</div>;

  return (
    <div className="leaderboard card" style={{ padding: 12, borderRadius: 8, border: "1px solid #eee" }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Top 5 (24h)</div>
      <ol>
        {rows.slice(0, 5).map((r, i) => {
          const name = typeof r.user === "object" ? r.user.username || r.user.name || r.user.id : r.user || r.username;
          const karma = r.karma ?? r.score ?? r.value ?? 0;
          return <li key={r.user?.id ?? r.username ?? i}>{name} — {karma}</li>;
        })}
      </ol>
    </div>
  );
}
