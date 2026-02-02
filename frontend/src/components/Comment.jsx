// frontend/src/components/Comment.jsx
import React, { useState } from "react";
import { likeComment } from "../api";

export default function Comment({ comment, depth = 0, onReply }) {
  const [likes, setLikes] = useState(comment.likes ?? 0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading || liked) return;
    setLoading(true);
    try {
      await likeComment(comment.id);
      setLikes((l) => l + 1);
      setLiked(true);
    } catch (err) {
      console.error("Like comment failed:", err);
      // optionally show user-friendly error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginLeft: depth * 16, borderLeft: depth ? "1px solid #eee" : "none", paddingLeft: 8, marginTop: 8 }}>
      <div style={{ fontSize: 14 }}>
        <strong>{comment.author_username ?? comment.author}</strong>
        <span style={{ marginLeft: 8, color: "#666", fontSize: 12 }}>
          {new Date(comment.created_at).toLocaleString()}
        </span>
      </div>

      <div style={{ marginTop: 6, fontSize: 15 }}>{comment.content}</div>

      <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={handleLike} disabled={loading || liked} style={{ cursor: loading ? "wait" : "pointer" }}>
          {liked ? "Liked" : "Like"} ({likes})
        </button>

        <button onClick={() => onReply && onReply(comment)} style={{ cursor: "pointer" }}>
          Reply
        </button>
      </div>

      {/* Render children replies if present */}
      {Array.isArray(comment.replies) && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((r) => (
            <Comment key={r.id} comment={r} depth={depth + 1} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}
