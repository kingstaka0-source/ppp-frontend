"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

type SearchResult = {
  id?: string | null;
  name?: string | null;
  description?: string | null;
  spotifyUrl?: string | null;
  imageUrl?: string | null;
  ownerId?: string | null;
  ownerDisplayName?: string | null;
  ownerSpotifyUrl?: string | null;
  trackCount?: number | null;
  isPublic?: boolean | null;
};

type AutomationResult = {
  inputName: string;
  spotifyPlaylistId: string;
  importedPlaylistDbId?: string;
  importStatus: "CREATED" | "UPDATED" | "FAILED";
  pitchStatus?: "DONE" | "FAILED" | "SKIPPED";
  createdPitches?: number;
  skippedPitches?: number;
  failedPitches?: number;
  queued?: number;
  error?: string;
};

type SearchResponse = {
  count?: number;
  results?: SearchResult[];
  error?: string;
  details?: string;
};

function safeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function safeText(value: unknown, fallback = "—") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export default function SpotifyPlaylistSearchForm() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [automationResults, setAutomationResults] = useState<AutomationResult[]>([]);

  async function search(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setAutomationResults([]);
      setMessage("");
      setError("Enter a search query first.");
      return;
    }

    setSearching(true);
    setMessage("");
    setError("");
    setAutomationResults([]);

    try {
      const res = await fetch(
        `${API}/playlists/search-spotify?q=${encodeURIComponent(trimmedQuery)}`
      );

      const data: SearchResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.details || data?.error || `Search failed (${res.status})`
        );
      }

      const nextResults = Array.isArray(data?.results) ? data.results : [];
      setResults(nextResults);
      setMessage(`Found ${safeNumber(data?.count ?? nextResults.length)} playlist results.`);
    } catch (error) {
      setResults([]);
      setError(error instanceof Error ? error.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  }

  async function importPlaylist(id: string) {
    if (!ARTIST_ID) {
      setError("Missing NEXT_PUBLIC_ARTIST_ID in .env.local");
      setMessage("");
      return;
    }

    if (!id) {
      setError("Missing Spotify playlist id.");
      setMessage("");
      return;
    }

    setImportingId(id);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API}/playlists/import-from-spotify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": ARTIST_ID,
        },
        body: JSON.stringify({
          playlistId: id,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.details || data?.error || `Import failed (${res.status})`
        );
      }

      setMessage(
        data?.created
          ? `Imported: ${data?.playlist?.name || "playlist"}`
          : `Updated: ${data?.playlist?.name || "playlist"}`
      );

      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setImportingId(null);
    }
  }

  async function importAndAutoPitchTop(n: number) {
    if (!ARTIST_ID) {
      setError("Missing NEXT_PUBLIC_ARTIST_ID in .env.local");
      setMessage("");
      return;
    }

    if (results.length === 0) {
      setError("Search for playlists first.");
      setMessage("");
      return;
    }

    setBulkRunning(true);
    setMessage("");
    setError("");
    setAutomationResults([]);

    const subset = results.slice(0, n);
    const output: AutomationResult[] = [];

    for (const item of subset) {
      const itemId = item.id || "";
      const itemName = safeText(item.name, "Unknown playlist");

      if (!itemId) {
        output.push({
          inputName: itemName,
          spotifyPlaylistId: "",
          importStatus: "FAILED",
          pitchStatus: "SKIPPED",
          error: "Playlist has no Spotify id.",
        });
        continue;
      }

      try {
        const importRes = await fetch(`${API}/playlists/import-from-spotify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-artist-id": ARTIST_ID,
          },
          body: JSON.stringify({
            playlistId: itemId,
          }),
        });

        const importJson = await importRes.json().catch(() => ({}));

        if (!importRes.ok) {
          output.push({
            inputName: itemName,
            spotifyPlaylistId: itemId,
            importStatus: "FAILED",
            pitchStatus: "SKIPPED",
            error:
              importJson?.details ||
              importJson?.error ||
              `Import failed (${importRes.status})`,
          });
          continue;
        }

        const playlistDbId =
          typeof importJson?.playlist?.id === "string" ? importJson.playlist.id : "";

        if (!playlistDbId) {
          output.push({
            inputName: itemName,
            spotifyPlaylistId: itemId,
            importStatus: "FAILED",
            pitchStatus: "SKIPPED",
            error: "Playlist imported but no database id returned.",
          });
          continue;
        }

        const pitchRes = await fetch(`${API}/playlists/${playlistDbId}/auto-pitch-all`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-artist-id": ARTIST_ID,
          },
        });

        const pitchJson = await pitchRes.json().catch(() => ({}));

        if (!pitchRes.ok) {
          output.push({
            inputName: itemName,
            spotifyPlaylistId: itemId,
            importedPlaylistDbId: playlistDbId,
            importStatus: importJson?.created ? "CREATED" : "UPDATED",
            pitchStatus: "FAILED",
            error:
              pitchJson?.details ||
              pitchJson?.error ||
              `Auto pitch failed (${pitchRes.status})`,
          });
          continue;
        }

        output.push({
          inputName: itemName,
          spotifyPlaylistId: itemId,
          importedPlaylistDbId: playlistDbId,
          importStatus: importJson?.created ? "CREATED" : "UPDATED",
          pitchStatus: "DONE",
          createdPitches: safeNumber(pitchJson?.created),
          skippedPitches: safeNumber(pitchJson?.skipped),
          failedPitches: safeNumber(pitchJson?.failed),
          queued: safeNumber(pitchJson?.queued),
        });
      } catch (error) {
        output.push({
          inputName: itemName,
          spotifyPlaylistId: itemId,
          importStatus: "FAILED",
          pitchStatus: "FAILED",
          error: error instanceof Error ? error.message : "Automation failed.",
        });
      }
    }

    setAutomationResults(output);

    const importedCount = output.filter((x) => x.importStatus !== "FAILED").length;
    const pitchedCount = output.filter((x) => x.pitchStatus === "DONE").length;

    setMessage(
      `Done. Imported/updated: ${importedCount}. Auto-pitched: ${pitchedCount}.`
    );

    setBulkRunning(false);
    router.refresh();
  }

  const hasResults = results.length > 0;
  const isBusy = searching || bulkRunning || importingId !== null;
  const missingArtistId = !ARTIST_ID;

  return (
    <div className="border rounded p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Search Spotify Playlists</h2>
        <p className="text-sm text-gray-600">
          Search Spotify directly and import playlists into your database.
        </p>
      </div>

      <form onSubmit={search} className="space-y-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="reggae playlist"
          className="w-full border rounded px-3 py-2"
          disabled={searching || bulkRunning}
        />

        <button
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={searching || bulkRunning}
        >
          {searching ? "Searching..." : "Search Spotify"}
        </button>
      </form>

      {missingArtistId ? (
        <div className="bg-yellow-50 border rounded p-3 text-sm text-yellow-900">
          Missing <strong>NEXT_PUBLIC_ARTIST_ID</strong> in <strong>.env.local</strong>.
          Import actions are disabled until this is set.
        </div>
      ) : null}

      {hasResults ? (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => importAndAutoPitchTop(3)}
            disabled={bulkRunning || searching || importingId !== null || !hasResults || missingArtistId}
            className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {bulkRunning ? "Running..." : "Import + Auto Pitch Top 3"}
          </button>

          <button
            onClick={() => importAndAutoPitchTop(5)}
            disabled={bulkRunning || searching || importingId !== null || !hasResults || missingArtistId}
            className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {bulkRunning ? "Running..." : "Import + Auto Pitch Top 5"}
          </button>

          <button
            onClick={() => importAndAutoPitchTop(10)}
            disabled={bulkRunning || searching || importingId !== null || !hasResults || missingArtistId}
            className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {bulkRunning ? "Running..." : "Import + Auto Pitch Top 10"}
          </button>
        </div>
      ) : null}

      {message ? (
        <div className="bg-green-50 border rounded p-3 text-sm text-green-900">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="bg-red-50 border rounded p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {automationResults.length > 0 ? (
        <div className="space-y-2">
          <h3 className="font-medium">Automation Results</h3>

          {automationResults.map((item, index) => (
            <div
              key={`${item.spotifyPlaylistId || "missing-id"}-${index}`}
              className={`border rounded p-3 text-sm ${
                item.error ? "bg-red-50" : "bg-green-50"
              }`}
            >
              <p>
                <strong>Playlist:</strong> {item.inputName}
              </p>
              <p>
                <strong>Spotify ID:</strong> {item.spotifyPlaylistId || "—"}
              </p>
              <p>
                <strong>Import:</strong> {item.importStatus}
              </p>
              <p>
                <strong>Pitch:</strong> {item.pitchStatus || "—"}
              </p>
              {item.importedPlaylistDbId ? (
                <p>
                  <strong>DB Playlist ID:</strong> {item.importedPlaylistDbId}
                </p>
              ) : null}
              {typeof item.createdPitches === "number" ? (
                <p>
                  <strong>Created Pitches:</strong> {item.createdPitches}
                </p>
              ) : null}
              {typeof item.skippedPitches === "number" ? (
                <p>
                  <strong>Skipped Pitches:</strong> {item.skippedPitches}
                </p>
              ) : null}
              {typeof item.failedPitches === "number" ? (
                <p>
                  <strong>Failed Pitches:</strong> {item.failedPitches}
                </p>
              ) : null}
              {typeof item.queued === "number" ? (
                <p>
                  <strong>Email Queued:</strong> {item.queued}
                </p>
              ) : null}
              {item.error ? (
                <p>
                  <strong>Error:</strong> {item.error}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {hasResults ? (
        <div className="space-y-3">
          {results.map((playlist, index) => {
            const playlistId = playlist.id || "";
            const playlistName = safeText(playlist.name, "Untitled playlist");
            const ownerName = safeText(playlist.ownerDisplayName);
            const trackCount = safeNumber(playlist.trackCount);
            const spotifyUrl = playlist.spotifyUrl || "";
            const description =
              typeof playlist.description === "string" && playlist.description.trim()
                ? playlist.description.trim()
                : "";

            return (
              <div
                key={playlistId || spotifyUrl || `${playlistName}-${index}`}
                className="border rounded p-3 flex justify-between gap-4 flex-wrap"
              >
                <div className="space-y-1 min-w-0">
                  <div className="font-semibold">{playlistName}</div>
                  <div className="text-sm">Owner: {ownerName}</div>
                  <div className="text-sm">Tracks: {trackCount}</div>
                  {description ? (
                    <div className="text-sm text-gray-600">{description}</div>
                  ) : null}
                  {spotifyUrl ? (
                    <a
                      href={spotifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm underline"
                    >
                      Open on Spotify
                    </a>
                  ) : null}
                </div>

                <button
                  onClick={() => importPlaylist(playlistId)}
                  disabled={!playlistId || importingId === playlistId || bulkRunning || searching || missingArtistId || isBusy && importingId !== playlistId}
                  className="px-3 py-2 bg-black text-white rounded disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {!playlistId
                    ? "No Spotify ID"
                    : importingId === playlistId
                    ? "Importing..."
                    : "Import"}
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      {!searching && !hasResults && query.trim() && !error ? (
        <div className="border rounded p-3 text-sm text-gray-500">
          No Spotify playlists found for this search.
        </div>
      ) : null}
    </div>
  );
}