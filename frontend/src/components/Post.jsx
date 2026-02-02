// frontend/src/components/Post.jsx
import React from "react";
import { likePost } from "../api";

function authorName(author) {
  if (!author) return "unknown";
  if (typeof author === "string") return author;
  if (typeof author === "object") {
    return author.username || author.name || (author.id ? `user-${author.id}` : JSON.stringify(author));
  }
  return String(author);
}

export default function Post({ post }) {
  const id = post.id ?? post.pk ?? post._id ?? null;
  const content = post.content ?? post.body ?? post.text ?? "";
  const createdAt = post.created_at ?? post.createdAt ?? post.date ?? "";
  const likes = post.likes_count ?? post.likes ?? post.like_count ?? 0;

  const handleLike = async () => {
    if (!id) {
      console.warn("Post has no id, can't like:", post);
      return;
    }
    try {
      await likePost(id);
      // simplest: reload the page or better: update state via context/parent
      window.location.reload();
    } catch (e) {
      console.error("like failed", e);
      alert("Failed to like post: " + e.message);
    }
  };

  return (
    <div className="post card" style={{ padding: 12, margin: 12, border: "1px solid #eee", borderRadius: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>{authorName(post.author)}</div>
        <div style={{ color: "#777", fontSize: 12 }}>{createdAt}</div>
      </div>

      <div style={{ marginBottom: 8 }}>{content}</div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={handleLike}>Like</button>
        <div style={{ color: "#333" }}>{likes} likes</div>
      </div>
    </div>
  );
}
