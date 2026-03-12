"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

export default function LaunchCampaignButton({
  trackId,
}: {
  trackId: string;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function launchCampaign() {
    if (!ARTIST_ID) {
      setError("Missing NEXT_PUBLIC_ARTIST_ID in .env.local");
      return;
    }

    setRunning(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API}/pitches/launch-campaign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": ARTIST_ID,
        },
        body: JSON.stringify({
          trackId,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || `Launch campaign failed (${res.status})`
        );
      }

      setMessage(
        `Campaign launched. Matches: ${data?.totalMatches ?? 0}. Created: ${data?.created ?? 0}. Queued: ${data?.queued ?? 0}. Drafted: ${data?.drafted ?? 0}. Skipped: ${data?.skipped ?? 0}.`
      );

      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Launch campaign failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={launchCampaign}
        disabled={running}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
      >
        {running ? "Launching..." : "Launch Campaign"}
      </button>

      {message ? (
        <div className="border rounded p-2 text-sm bg-green-100">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="border rounded p-2 text-sm bg-red-100">
          {error}
        </div>
      ) : null}
    </div>
  );
}