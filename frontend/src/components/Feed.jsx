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
        <h2 className="text-2xl font-bold text-white drop-shadow-lg">Latest Posts</h2>
        <button
          onClick={load}
          className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-all font-semibold border border-white/30"
        >
          🔄 Refresh
        </button>
      </div>

      {loading && (
        <div className="p-12 bg-white/95 backdrop-blur rounded-2xl shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading posts...</p>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="p-12 bg-white/95 backdrop-blur rounded-2xl shadow-lg text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-700 font-semibold text-lg">No posts yet</p>
          <p className="text-gray-500 mt-2">Be the first to create a post!</p>
        </div>
      )}

      <div className="space-y-6">
        {posts.map(p => (
          <Post key={p.id} post={p} onLike={() => load()} />
        ))}
      </div>
    </div>
  );
}
