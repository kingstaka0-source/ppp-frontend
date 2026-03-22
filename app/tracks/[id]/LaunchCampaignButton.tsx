"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

export default function LaunchCampaignButton({
  trackId,
  artistId,
  disabled = false,
  lockedReason,
}: {
  trackId: string;
  artistId: string;
  disabled?: boolean;
  lockedReason?: string;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function launchCampaign() {
    if (disabled) {
      setError(lockedReason || "Upgrade required");
      return;
    }

    if (!artistId) {
      setError("Missing artistId");
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
          "x-artist-id": artistId,
        },
        body: JSON.stringify({
          trackId,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 403 && data?.upgradeRequired) {
          setError(data?.message || "Upgrade required");
          return;
        }

        throw new Error(
          data?.message || data?.error || `Launch campaign failed (${res.status})`
        );
      }

      setMessage(
        `Campaign launched. Created: ${data?.created ?? 0}. Skipped existing: ${data?.skippedExisting ?? 0}. Skipped no email: ${data?.skippedNoEmail ?? 0}.`
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
        disabled={disabled || running}
        className={`px-4 py-2 rounded transition ${
          disabled || running
            ? "cursor-not-allowed bg-gray-200 text-gray-500"
            : "bg-blue-600 text-white"
        }`}
      >
        {running ? "Launching..." : "Launch Campaign"}
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
        <div className="border rounded p-2 text-sm bg-green-100">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="border rounded p-2 text-sm bg-red-100">
          {error.toLowerCase().includes("upgrade") ? (
            <>
              {error}{" "}
              <Link
                href={`/upgrade?artistId=${encodeURIComponent(artistId)}`}
                className="underline"
              >
                Upgrade
              </Link>
            </>
          ) : (
            error
          )}
        </div>
      ) : null}
    </div>
  );
}