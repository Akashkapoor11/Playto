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

  const getTrophyIcon = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "🏅";
  };

  const getRankColor = (index) => {
    if (index === 0) return "from-yellow-400 to-yellow-600";
    if (index === 1) return "from-gray-300 to-gray-500";
    if (index === 2) return "from-orange-400 to-orange-600";
    return "from-purple-400 to-purple-600";
  };

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-6 sticky top-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-500 mt-3 text-sm">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-6 sticky top-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🏆</span>
          <span>Top 5 (24h)</span>
        </h3>
        <p className="text-gray-500 text-sm text-center py-4">No activity in last 24 hours</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-6 sticky top-6 border-2 border-white/20">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 drop-shadow-lg">
        <span className="text-2xl">🏆</span>
        <span>Top 5 (24h)</span>
      </h3>
      <div className="space-y-3">
        {rows.slice(0, 5).map((row, index) => {
          const username = row.owner_username || "Unknown";
          const karma = row.total_karma || 0;

          return (
            <div
              key={row.owner_id || index}
              className="bg-white/95 backdrop-blur rounded-xl p-4 flex items-center justify-between hover:bg-white transition-all shadow-md hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(index)} text-white font-bold shadow-lg text-lg`}>
                  {getTrophyIcon(index)}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{username}</div>
                  <div className="text-xs text-gray-500">Rank #{index + 1}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {karma}
                </div>
                <div className="text-xs text-gray-500">karma</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
