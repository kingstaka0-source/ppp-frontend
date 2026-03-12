"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

function looksLikeSpotifyPlaylistUrl(value: string) {
  const trimmed = value.trim();

  return (
    trimmed.includes("open.spotify.com/playlist/") ||
    trimmed.startsWith("spotify:playlist:")
  );
}

export default function ImportPlaylistForm() {
  const router = useRouter();

  const [playlistUrl, setPlaylistUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trimmedUrl = playlistUrl.trim();
  const missingArtistId = !ARTIST_ID;
  const canSubmit = !loading && !missingArtistId && !!trimmedUrl;

  async function handleImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage(null);
    setError(null);

    if (!ARTIST_ID) {
      setError("Missing NEXT_PUBLIC_ARTIST_ID in .env.local");
      return;
    }

    if (!trimmedUrl) {
      setError("Paste a Spotify playlist link first.");
      return;
    }

    if (!looksLikeSpotifyPlaylistUrl(trimmedUrl)) {
      setError("Paste a valid Spotify playlist URL or spotify:playlist link.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/playlists/import-from-spotify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": ARTIST_ID,
        },
        body: JSON.stringify({
          playlistUrl: trimmedUrl,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          json?.details || json?.error || `Import failed (${res.status})`
        );
      }

      setMessage(
        json?.created
          ? `Imported: ${json?.playlist?.name || "playlist"}`
          : `Updated: ${json?.playlist?.name || "playlist"}`
      );

      setPlaylistUrl("");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded p-4 space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Import Spotify Playlist</h2>
        <p className="text-sm text-gray-600">
          Paste a Spotify playlist link to import it into your database.
        </p>
      </div>

      {missingArtistId ? (
        <div className="text-sm border rounded px-3 py-2 bg-yellow-50 text-yellow-900">
          Missing <strong>NEXT_PUBLIC_ARTIST_ID</strong> in <strong>.env.local</strong>.
        </div>
      ) : null}

      <form onSubmit={handleImport} className="space-y-3">
        <input
          type="text"
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          placeholder="https://open.spotify.com/playlist/..."
          className="w-full border rounded px-3 py-2 disabled:opacity-60"
          disabled={loading || missingArtistId}
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Importing..." : "Import Playlist"}
        </button>
      </form>

      {message ? (
        <div className="text-sm border rounded px-3 py-2 bg-green-50 text-green-900">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="text-sm border rounded px-3 py-2 bg-red-50 text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}