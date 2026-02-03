import React, { useState } from "react";
import { likeComment, createComment } from "../api";

export default function Comment({ comment, depth = 0, postId, onUpdate }) {
  const [likes, setLikes] = useState(comment.likes ?? 0);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = async () => {
    try {
      await likeComment(comment.id);
      setLikes(likes + 1);
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error("Like failed:", e);
      alert(e.message);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment(postId, replyContent, comment.id);
      setReplyContent("");
      setShowReplyBox(false);
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error("Reply failed:", e);
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-purple-200' : ''} py-3`}
    >
      <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-all">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {(comment.author?.username || comment.author || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <span className="font-semibold text-gray-800 text-sm">
              {comment.author?.username || comment.author || 'Unknown'}
            </span>
            <span className="text-gray-400 text-xs ml-2">
              {new Date(comment.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="text-gray-700 text-sm mb-2 ml-9">{comment.content}</div>

        <div className="flex items-center gap-3 ml-9">
          <button
            onClick={handleLike}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 hover:bg-purple-50 px-2 py-1 rounded transition-all"
          >
            <span>👍</span>
            <span>{likes}</span>
          </button>
          <button
            onClick={() => setShowReplyBox(!showReplyBox)}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium hover:bg-gray-200 px-2 py-1 rounded transition-all"
          >
            Reply
          </button>
        </div>

        {showReplyBox && (
          <div className="ml-9 mt-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="2"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleReply}
                disabled={isSubmitting || !replyContent.trim()}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Posting..." : "Post Reply"}
              </button>
              <button
                onClick={() => {
                  setShowReplyBox(false);
                  setReplyContent("");
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {Array.isArray(comment.replies) && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              postId={postId}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
