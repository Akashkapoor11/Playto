const BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

export async function fetchFeed() {
  const res = await fetch(`${BASE_URL}/feed/`);
  if (!res.ok) {
    throw new Error("Failed to fetch feed");
  }
  return res.json();
}

export async function fetchLeaderboard() {
  const res = await fetch(`${BASE_URL}/leaderboard/`);
  if (!res.ok) {
    throw new Error("Failed to fetch leaderboard");
  }
  return res.json();
}

export async function likePost(postId) {
  const res = await fetch(`${BASE_URL}/like/post/${postId}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to like post");
  }

  return res.json();
}

export async function likeComment(commentId) {
  const res = await fetch(`${BASE_URL}/like/comment/${commentId}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to like comment");
  }

  return res.json();
}

export async function createComment(postId, content, parentId = null) {
  const res = await fetch(`${BASE_URL}/posts/${postId}/comments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      parent_id: parentId,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to create comment");
  }

  return res.json();
}
