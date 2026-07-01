"use client";

import { useState } from "react";

export default function DemoVideoButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-white/25 px-8 py-4 font-black hover:bg-white hover:text-black transition"
      >
        ▶ Watch Demo
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-6 top-6 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white hover:bg-white hover:text-black"
          >
            ✕
          </button>

          <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
            <video
              src="/tunereach-demo.mp4"
              controls
              autoPlay
              className="h-full w-full"
            />
          </div>
        </div>
      )}
    </>
  );
}