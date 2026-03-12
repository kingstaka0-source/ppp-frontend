"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

export default function PitchButton({
  matchId,
  already,
}: {
  matchId: string;
  already: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function createOrOpenPitch() {
    if (!ARTIST_ID) {
      alert("Missing NEXT_PUBLIC_ARTIST_ID in .env.local");
      return;
    }

    setLoading(true);

    try {
      const createRes = await fetch(`${API}/pitches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": ARTIST_ID,
        },
        body: JSON.stringify({ matchId, channel: "EMAIL" }),
      });

      const createJson = await createRes.json().catch(() => ({}));

      if (!createRes.ok) {
        throw new Error(createJson?.error || createJson?.message || `Pitch failed (${createRes.status})`);
      }

      const pitch = createJson?.pitch;
      if (!pitch?.id) {
        throw new Error("Pitch was created but no pitch id was returned");
      }

      // Alleen AI generate-and-save doen als het een nieuwe of draft pitch is
      if (pitch.status === "DRAFT") {
        const aiRes = await fetch(`${API}/ai/generate-and-save-pitch`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-artist-id": ARTIST_ID,
          },
          body: JSON.stringify({ pitchId: pitch.id }),
        });

        const aiJson = await aiRes.json().catch(() => ({}));

        if (!aiRes.ok) {
          throw new Error(aiJson?.error || aiJson?.message || `AI failed (${aiRes.status})`);
        }
      }

      window.location.href = `/pitches/${pitch.id}`;
    } catch (e: any) {
      alert(e?.message || "Pitch failed");
    } finally {
      setLoading(false);
    }
  }

  if (already) {
    return (
      <span className="text-sm px-3 py-2 rounded border border-black">
        Pitched ✅
      </span>
    );
  }

  return (
    <button
      className="px-3 py-2 rounded bg-black text-white disabled:opacity-60"
      disabled={loading}
      onClick={createOrOpenPitch}
    >
      {loading ? "Preparing…" : "Pitch →"}
    </button>
  );
}