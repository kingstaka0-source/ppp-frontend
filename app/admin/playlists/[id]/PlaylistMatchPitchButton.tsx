"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

type CreatePitchResponse = {
  pitch?: {
    id?: string;
    status?: string;
  };
  error?: string;
  message?: string;
};

type GenerateAiPitchResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
};

export default function PlaylistMatchPitchButton({
  matchId,
  pitchId,
}: {
  matchId: string;
  pitchId?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const missingArtistId = !ARTIST_ID;
  const missingMatchId = !matchId;
  const cannotRun = loading || (!pitchId && (missingArtistId || missingMatchId));

  async function handleClick() {
    setError(null);

    if (pitchId) {
      window.location.href = `/pitches/${pitchId}`;
      return;
    }

    if (!ARTIST_ID) {
      setError("Missing NEXT_PUBLIC_ARTIST_ID in .env.local");
      return;
    }

    if (!matchId) {
      setError("Missing match id.");
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
        body: JSON.stringify({
          matchId,
          channel: "EMAIL",
        }),
      });

      const createJson: CreatePitchResponse = await createRes.json().catch(() => ({}));

      if (!createRes.ok) {
        throw new Error(
          createJson?.error ||
            createJson?.message ||
            `Pitch failed (${createRes.status})`
        );
      }

      const createdPitch = createJson?.pitch;

      if (!createdPitch?.id) {
        throw new Error("Pitch created but no pitch id returned.");
      }

      if (createdPitch.status === "DRAFT") {
        const aiRes = await fetch(`${API}/ai/generate-and-save-pitch`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-artist-id": ARTIST_ID,
          },
          body: JSON.stringify({
            pitchId: createdPitch.id,
          }),
        });

        const aiJson: GenerateAiPitchResponse = await aiRes.json().catch(() => ({}));

        if (!aiRes.ok) {
          throw new Error(
            aiJson?.error || aiJson?.message || `AI failed (${aiRes.status})`
          );
        }
      }

      window.location.href = `/pitches/${createdPitch.id}`;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Pitch failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={cannotRun}
        className="px-3 py-2 rounded bg-black text-white disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Working..." : pitchId ? "Open Pitch" : "Create Pitch"}
      </button>

      {!pitchId && missingArtistId ? (
        <div className="text-xs border rounded px-2 py-1 bg-yellow-50 text-yellow-900">
          Missing NEXT_PUBLIC_ARTIST_ID.
        </div>
      ) : null}

      {!pitchId && missingMatchId ? (
        <div className="text-xs border rounded px-2 py-1 bg-yellow-50 text-yellow-900">
          Missing match id.
        </div>
      ) : null}

      {error ? (
        <div className="text-xs border rounded px-2 py-1 bg-red-50 text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}