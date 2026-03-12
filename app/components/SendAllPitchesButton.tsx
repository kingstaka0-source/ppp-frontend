"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

export default function SendAllPitchesButton({ trackId }: { trackId: string }) {
  const [sendingDrafts, setSendingDrafts] = useState(false);
  const [autoSending, setAutoSending] = useState(false);

  async function callEndpoint(url: string, mode: "drafts" | "auto") {
    const confirmText =
      mode === "drafts"
        ? "Send all existing DRAFT pitches for this track now?\n\nIn test mode this sends to kingstaka0@gmail.com."
        : "Auto create/generate/send pitches for this track now?\n\nIn test mode this sends to kingstaka0@gmail.com.";

    const ok = window.confirm(confirmText);
    if (!ok) return;

    try {
      if (mode === "drafts") setSendingDrafts(true);
      if (mode === "auto") setAutoSending(true);

      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": ARTIST_ID,
        },
      });

      const j = await r.json().catch(() => ({}));

      if (!r.ok) {
        throw new Error(j?.error || j?.message || "Request failed");
      }

      alert(
        `Done ✅\n\nTotal: ${j.total ?? 0}\nSent: ${j.sentCount ?? 0}\nFailed: ${j.failedCount ?? 0}`
      );

      window.location.reload();
    } catch (e: any) {
      alert(e?.message || "Request failed");
    } finally {
      setSendingDrafts(false);
      setAutoSending(false);
    }
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => callEndpoint(`${API}/tracks/${trackId}/send-all`, "drafts")}
        disabled={sendingDrafts || autoSending}
        className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
      >
        {sendingDrafts ? "Sending..." : "Send All Draft Pitches"}
      </button>

      <button
        onClick={() => callEndpoint(`${API}/tracks/${trackId}/auto-pitch-send`, "auto")}
        disabled={autoSending || sendingDrafts}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {autoSending ? "Auto Sending..." : "Auto Pitch + Send"}
      </button>
    </div>
  );
}