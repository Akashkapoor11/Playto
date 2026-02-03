import React, { useState } from "react";
import Comment from "./Comment";
import { likePost, createComment } from "../api";

function authorName(author) {
  if (!author) return "unknown";
  if (typeof author === "string") return author;
  if (typeof author === "object") {
    return author.username || author.name || (author.id ? `user-${author.id}` : JSON.stringify(author));
  }
  return String(author);
}

export default function Post({ post, onLike }) {
  const id = post.id ?? post.pk ?? post._id ?? null;
  const content = post.content ?? post.body ?? post.text ?? "";
  const createdAt = post.created_at ?? post.createdAt ?? post.date ?? "";
  const likes = post.likes ?? 0;
  const comments = post.comments || [];

  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = async () => {
    if (!id) {
      console.warn("Post has no id, can't like:", post);
      return;
    }
    try {
      await likePost(id);
      if (onLike) onLike();
    } catch (e) {
      console.error("like failed", e);
      alert("Failed to like post: " + e.message);
    }
  };

  const handleAddComment = async () => {
    if (!commentContent.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment(id, commentContent, null);
      setCommentContent("");
      setShowCommentBox(false);
      if (onLike) onLike(); // Refresh feed to show new comment
    } catch (e) {
      console.error("Comment failed:", e);
      alert("Failed to add comment: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/20">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {authorName(post.author).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-gray-800">{authorName(post.author)}</div>
              <div className="text-xs text-gray-500">{new Date(createdAt).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="text-gray-700 text-base leading-relaxed">{content}</div>
      </div>

      <div className="px-6 py-4 bg-gray-50/50 flex items-center gap-4">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all"
        >
          <span>❤️</span>
          <span>Like</span>
        </button>
        <div className="text-gray-600 font-medium">
          {likes} {likes === 1 ? 'like' : 'likes'}
        </div>
        <button
          onClick={() => setShowCommentBox(!showCommentBox)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 shadow-md hover:shadow-lg transition-all ml-auto"
        >
          <span>💬</span>
          <span>Comment</span>
        </button>
        <div className="text-gray-500 text-sm">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </div>
      </div>

      {showCommentBox && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows="3"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddComment}
              disabled={isSubmitting || !commentContent.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </button>
            <button
              onClick={() => {
                setShowCommentBox(false);
                setCommentContent("");
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-400 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {comments.length > 0 && (
        <div className="px-6 py-4 bg-white border-t border-gray-100">
          <div className="text-sm font-semibold text-gray-700 mb-3">Comments</div>
          <div className="space-y-3">
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                postId={id}
                onUpdate={onLike}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
