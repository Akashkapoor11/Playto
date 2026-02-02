import React, { useEffect, useState } from "react";
import Post from "./Post";
import { fetchFeed } from "../api";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchFeed();
      setPosts(data);
    } catch (err) {
      console.error("fetch feed error", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Latest Posts</h2>
        <button onClick={load} className="text-sm text-slate-500 hover:text-slate-700">Refresh</button>
      </div>

      {loading && <div className="p-8 bg-white rounded-lg shadow-sm text-center text-slate-500">Loading posts…</div>}

      {!loading && posts.length === 0 && (
        <div className="p-8 bg-white rounded-lg shadow-sm text-center">
          <p className="text-slate-600">No posts yet — create the first one 🚀</p>
        </div>
      )}

      <div className="space-y-4">
        {posts.map(p => (
          <Post key={p.id} post={p} onLike={() => load()} />
        ))}
      </div>
    </div>
  );
}
