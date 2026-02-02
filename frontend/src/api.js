// frontend/src/api.js

const BASE_URL = "http://127.0.0.1:8000/api";

// -------------------- FEED --------------------
export async function fetchFeed() {
  const res = await fetch(`${BASE_URL}/feed/`);
  if (!res.ok) {
    throw new Error("Failed to fetch feed");
  }
  return res.json();
}

// -------------------- LEADERBOARD --------------------
export async function fetchLeaderboard() {
  const res = await fetch(`${BASE_URL}/leaderboard/`);
  if (!res.ok) {
    throw new Error("Failed to fetch leaderboard");
  }
  return res.json();
}

// -------------------- LIKE POST --------------------
export async function likePost(postId) {
  const res = await fetch(`${BASE_URL}/posts/${postId}/like/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to like post");
  }

  return res.json();
}
