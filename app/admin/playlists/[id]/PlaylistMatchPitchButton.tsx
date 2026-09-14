"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

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
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const missingMatchId = !matchId;
  const cannotRun =
    loading || (!pitchId && missingMatchId);

  async function handleClick() {
    setError(null);

    if (pitchId) {
      window.location.href =
        `/pitches/${pitchId}`;
      return;
    }

    if (!matchId) {
      setError("Missing match id.");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();

      if (!token) {
        throw new Error(
          "Could not get authentication token.",
        );
      }

      const createRes = await fetch(
        `${API}/pitches`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId,
            channel: "EMAIL",
          }),
        },
      );

      const createJson: CreatePitchResponse =
        await createRes
          .json()
          .catch(() => ({}));

      if (!createRes.ok) {
        throw new Error(
          createJson?.message ||
            createJson?.error ||
            `Pitch failed (${createRes.status})`,
        );
      }

      const createdPitch = createJson?.pitch;

      if (!createdPitch?.id) {
        throw new Error(
          "Pitch created but no pitch id returned.",
        );
      }

      if (createdPitch.status === "DRAFT") {
        const aiRes = await fetch(
          `${API}/ai/generate-and-save-pitch`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              matchId,
              channel: "EMAIL",
            }),
          },
        );

        const aiJson: GenerateAiPitchResponse =
          await aiRes
            .json()
            .catch(() => ({}));

        if (!aiRes.ok) {
          throw new Error(
            aiJson?.message ||
              aiJson?.error ||
              `AI failed (${aiRes.status})`,
          );
        }
      }

      window.location.href =
        `/pitches/${createdPitch.id}`;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Pitch failed.",
      );
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
        {loading
          ? "Working..."
          : pitchId
            ? "Open Pitch"
            : "Create Pitch"}
      </button>

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