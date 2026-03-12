"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

type AutoPitchResultItem = {
  matchId?: string;
  trackId?: string;
  trackTitle?: string | null;
  status?: string;
  pitchId?: string;
  channel?: string;
  error?: string;
};

type AutoPitchResponse = {
  ok?: boolean;
  playlistId?: string;
  playlistName?: string;
  totalMatches?: number;
  ownedMatches?: number;
  created?: number;
  skipped?: number;
  failed?: number;
  queued?: number;
  results?: AutoPitchResultItem[];
  error?: string;
  details?: string;
};

function safeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function safeText(value: unknown, fallback = "—") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export default function AutoPitchAllButton({
  playlistId,
}: {
  playlistId: string;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AutoPitchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const missingArtistId = !ARTIST_ID;
  const missingPlaylistId = !playlistId;
  const cannotRun = loading || missingArtistId || missingPlaylistId;

  async function handleAutoPitchAll() {
    setResult(null);
    setError(null);

    if (!ARTIST_ID) {
      setError("Missing NEXT_PUBLIC_ARTIST_ID in .env.local");
      return;
    }

    if (!playlistId) {
      setError("Missing playlist id.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/playlists/${playlistId}/auto-pitch-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": ARTIST_ID,
        },
      });

      const json: AutoPitchResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          json?.details || json?.error || `Auto pitch all failed (${res.status})`
        );
      }

      setResult({
        ok: json?.ok ?? true,
        playlistId: json?.playlistId || playlistId,
        playlistName: json?.playlistName || "Playlist",
        totalMatches: safeNumber(json?.totalMatches),
        ownedMatches: safeNumber(json?.ownedMatches),
        created: safeNumber(json?.created),
        skipped: safeNumber(json?.skipped),
        failed: safeNumber(json?.failed),
        queued: safeNumber(json?.queued),
        results: Array.isArray(json?.results) ? json.results : [],
      });

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Auto pitch all failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const resultItems = Array.isArray(result?.results) ? result.results : [];

  return (
    <div className="border rounded p-4 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleAutoPitchAll}
          disabled={cannotRun}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Running..." : "Auto Pitch All Matches"}
        </button>

        <p className="text-sm text-gray-600">
          Creates pitches for playlist matches that do not already have a pitch.
        </p>
      </div>

      {missingArtistId ? (
        <div className="text-sm border rounded px-3 py-2 bg-yellow-50 text-yellow-900">
          Missing <strong>NEXT_PUBLIC_ARTIST_ID</strong> in <strong>.env.local</strong>.
        </div>
      ) : null}

      {missingPlaylistId ? (
        <div className="text-sm border rounded px-3 py-2 bg-yellow-50 text-yellow-900">
          Missing playlist id for this page.
        </div>
      ) : null}

      {error ? (
        <div className="text-sm border rounded px-3 py-2 bg-red-50 text-red-700">
          <strong>Auto pitch failed.</strong>
          <div className="mt-1">{error}</div>
        </div>
      ) : null}

      {result ? (
        <div className="space-y-3">
          <div className="text-sm border rounded px-3 py-2 bg-green-50 text-green-900">
            Done. Created: {safeNumber(result.created)}. Skipped:{" "}
            {safeNumber(result.skipped)}. Failed: {safeNumber(result.failed)}.
            Queued: {safeNumber(result.queued)}.
          </div>

          <div className="text-sm border rounded p-3 bg-gray-50 space-y-1">
            <p>
              <strong>Playlist:</strong> {safeText(result.playlistName, "Playlist")}
            </p>
            <p>
              <strong>Total matches:</strong> {safeNumber(result.totalMatches)}
            </p>
            <p>
              <strong>Owned matches:</strong> {safeNumber(result.ownedMatches)}
            </p>
            <p>
              <strong>OK:</strong> {result.ok ? "true" : "false"}
            </p>
          </div>

          {resultItems.length > 0 ? (
            <div className="space-y-2">
              <h3 className="font-medium">Results</h3>

              {resultItems.map((item, index) => {
                const status = safeText(item.status);
                const bgClass =
                  status === "FAILED"
                    ? "bg-red-50 text-red-700"
                    : status === "CREATED" || status === "QUEUED"
                    ? "bg-green-50 text-green-900"
                    : "bg-yellow-50 text-yellow-900";

                return (
                  <div
                    key={`${item.matchId || "match"}-${index}`}
                    className={`border rounded p-3 text-sm ${bgClass}`}
                  >
                    <p>
                      <strong>Track:</strong> {safeText(item.trackTitle)}
                    </p>
                    <p>
                      <strong>Status:</strong> {status}
                    </p>
                    {item.pitchId ? (
                      <p>
                        <strong>Pitch ID:</strong> {item.pitchId}
                      </p>
                    ) : null}
                    {item.channel ? (
                      <p>
                        <strong>Channel:</strong> {item.channel}
                      </p>
                    ) : null}
                    {item.error ? (
                      <p>
                        <strong>Error:</strong> {item.error}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}