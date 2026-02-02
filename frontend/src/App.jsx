import React from "react";
import Feed from "./components/Feed";
import Leaderboard from "./components/Leaderboard";
import "./index.css";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-white/60 backdrop-blur sticky top-0 z-30 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                PT
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Playto Community Feed</h1>
                <p className="text-sm text-slate-500">Threaded discussions • Live leaderboard</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition">New Post</button>
              <button className="px-3 py-1 bg-white border rounded-md hover:shadow">Sign In</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2">
            <Feed />
          </section>

          <aside className="lg:col-span-1">
            <Leaderboard />
          </aside>
        </div>
      </main>
    </div>
  );
}
