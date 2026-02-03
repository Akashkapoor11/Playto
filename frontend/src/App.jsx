import React from "react";
import Feed from "./components/Feed";
import Leaderboard from "./components/Leaderboard";
import "./index.css";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-pink-500 to-yellow-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                PT
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">Playto Community Feed</h1>
                <p className="text-sm text-white/80">Threaded discussions • Live leaderboard</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg shadow-lg hover:shadow-xl font-semibold">
                New Post
              </button>
              <button className="px-4 py-2 bg-white/20 backdrop-blur text-white border border-white/30 rounded-lg hover:bg-white/30 font-semibold">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <Feed />
          </section>

          <aside className="lg:col-span-1">
            <Leaderboard />
          </aside>
        </div>
      </main>

      <footer className="text-center py-6 text-white/60 text-sm">
        <p>Built for Playto Engineering Challenge 🚀</p>
      </footer>
    </div>
  );
}
