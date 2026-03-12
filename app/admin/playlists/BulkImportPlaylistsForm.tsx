"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

type BulkResult = {
  input: string;
  ok: boolean;
  name?: string;
  message: string;
};

function normalizeLines(value: string) {
  const seen = new Set<string>();

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => {
      if (seen.has(line)) return false;
      seen.add(line);
      return true;
    });
}

function looksLikeSpotifyPlaylistUrl(value: string) {
  const trimmed = value.trim();

  return (
    trimmed.includes("open.spotify.com/playlist/") ||
    trimmed.startsWith("spotify:playlist:")
  );
}

export default function BulkImportPlaylistsForm() {
  const router = useRouter();

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BulkResult[]>([]);

  const lines = useMemo(() => normalizeLines(text), [text]);
  const missingArtistId = !ARTIST_ID;
  const canSubmit = !loading && !missingArtistId && lines.length > 0;

  async function handleBulkImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSummary(null);
    setError(null);
    setResults([]);

    if (!ARTIST_ID) {
      setError("Missing NEXT_PUBLIC_ARTIST_ID in .env.local");
      return;
    }

    if (lines.length === 0) {
      setError("Paste at least 1 Spotify playlist link.");
      return;
    }

    const invalidLines = lines.filter((line) => !looksLikeSpotifyPlaylistUrl(line));

    if (invalidLines.length > 0) {
      setError(
        `Some lines are not valid Spotify playlist links. Invalid count: ${invalidLines.length}.`
      );
      return;
    }

    setLoading(true);

    let okCount = 0;
    let failCount = 0;
    const output: BulkResult[] = [];

    try {
      for (const line of lines) {
        try {
          const res = await fetch(`${API}/playlists/import-from-spotify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-artist-id": ARTIST_ID,
            },
            body: JSON.stringify({
              playlistUrl: line,
            }),
          });

          const json = await res.json().catch(() => ({}));

          if (!res.ok) {
            failCount += 1;
            output.push({
              input: line,
              ok: false,
              message:
                json?.details || json?.error || `Import failed (${res.status})`,
            });
            continue;
          }

          okCount += 1;
          output.push({
            input: line,
            ok: true,
            name: json?.playlist?.name || "playlist",
            message: json?.created ? "Imported" : "Updated",
          });
        } catch (error) {
          failCount += 1;
          output.push({
            input: line,
            ok: false,
            message: error instanceof Error ? error.message : "Import failed.",
          });
        }
      }

      setResults(output);
      setSummary(`Done. Success: ${okCount}. Failed: ${failCount}.`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded p-4 space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Bulk Import Spotify Playlists</h2>
        <p className="text-sm text-gray-600">
          Paste multiple Spotify playlist links. Use one link per line.
        </p>
      </div>

      {missingArtistId ? (
        <div className="text-sm border rounded px-3 py-2 bg-yellow-50 text-yellow-900">
          Missing <strong>NEXT_PUBLIC_ARTIST_ID</strong> in <strong>.env.local</strong>.
        </div>
      ) : null}

      <form onSubmit={handleBulkImport} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`https://open.spotify.com/playlist/...
https://open.spotify.com/playlist/...
https://open.spotify.com/playlist/...`}
          className="w-full min-h-[180px] border rounded px-3 py-2 disabled:opacity-60"
          disabled={loading || missingArtistId}
        />

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="submit"
            disabled={!canSubmit}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Bulk Importing..." : "Bulk Import"}
          </button>

          <span className="text-sm text-gray-600">
            Lines detected: {lines.length}
          </span>
        </div>
      </form>

      {summary ? (
        <div className="text-sm border rounded px-3 py-2 bg-green-50 text-green-900">
          {summary}
        </div>
      ) : null}

      {error ? (
        <div className="text-sm border rounded px-3 py-2 bg-red-50 text-red-700">
          {error}
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="space-y-2">
          <h3 className="font-medium">Results</h3>

          <div className="space-y-2">
            {results.map((item, index) => (
              <div
                key={`${item.input}-${index}`}
                className={`border rounded p-3 text-sm ${
                  item.ok ? "bg-green-50 text-green-900" : "bg-red-50 text-red-700"
                }`}
              >
                <p>
                  <strong>Input:</strong> {item.input}
                </p>
                <p>
                  <strong>Status:</strong> {item.ok ? "OK" : "FAILED"}
                </p>
                {item.name ? (
                  <p>
                    <strong>Playlist:</strong> {item.name}
                  </p>
                ) : null}
                <p>
                  <strong>Message:</strong> {item.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}