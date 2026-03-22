"use client";

import Link from "next/link";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

export default function PitchButton({
  matchId,
  already,
  artistId,
  disabled = false,
  lockedReason,
}: {
  matchId: string;
  already: boolean;
  artistId: string;
  disabled?: boolean;
  lockedReason?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function createOrOpenPitch() {
    if (disabled) {
      setMessage(lockedReason || "Upgrade required");
      return;
    }

    if (!artistId) {
      setMessage("Missing artistId");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const createRes = await fetch(`${API}/pitches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": artistId,
        },
        body: JSON.stringify({ matchId, channel: "EMAIL" }),
      });

      const createJson = await createRes.json().catch(() => ({}));

      if (!createRes.ok) {
        if (createRes.status === 403 && createJson?.upgradeRequired) {
          setMessage(createJson?.message || "Upgrade required");
          return;
        }

        throw new Error(
          createJson?.error ||
            createJson?.message ||
            `Pitch failed (${createRes.status})`
        );
      }

      const pitch = createJson?.pitch;

      if (!pitch?.id) {
        throw new Error("Pitch was created but no pitch id was returned");
      }

      if (pitch.status === "DRAFT") {
        const aiRes = await fetch(`${API}/ai/generate-and-save-pitch`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-artist-id": artistId,
          },
          body: JSON.stringify({ matchId }),
        });

        const aiJson = await aiRes.json().catch(() => ({}));

        if (!aiRes.ok) {
          throw new Error(
            aiJson?.error || aiJson?.message || `AI failed (${aiRes.status})`
          );
        }
      }

      window.location.href = `/pitches/${pitch.id}?artistId=${encodeURIComponent(
        artistId
      )}`;
    } catch (e: any) {
      setMessage(e?.message || "Pitch failed");
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
    <div className="space-y-2">
      <button
        className={`px-3 py-2 rounded transition ${
          disabled || loading
            ? "cursor-not-allowed bg-gray-200 text-gray-500"
            : "bg-black text-white"
        }`}
        disabled={disabled || loading}
        onClick={createOrOpenPitch}
      >
        {loading ? "Preparing…" : "Pitch →"}
      </button>

      {disabled && lockedReason ? (
        <div className="text-xs text-amber-700">
          {lockedReason}{" "}
          <Link
            href={`/upgrade?artistId=${encodeURIComponent(artistId)}`}
            className="underline"
          >
            Upgrade
          </Link>
        </div>
      ) : null}

      {message ? (
        <div className="text-xs text-gray-700">
          {message.toLowerCase().includes("upgrade") ? (
            <>
              {message}{" "}
              <Link
                href={`/upgrade?artistId=${encodeURIComponent(artistId)}`}
                className="underline"
              >
                Upgrade
              </Link>
            </>
          ) : (
            message
          )}
        </div>
      ) : null}
    </div>
  );
}