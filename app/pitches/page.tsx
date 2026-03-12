"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PitchRow = {
  id: string;
  matchId: string;
  subject: string;
  body: string;
  status: "DRAFT" | "QUEUED" | "SENT";
  channel: "INAPP" | "EMAIL";
  createdAt: string;
  sentAt?: string | null;
  sentTo?: string | null;
  match?: {
    id: string;
    trackId: string;
    playlistId: string;
  } | null;
  track?: {
    id: string;
    title: string;
    spotifyTrackId?: string | null;
    artists?: string[];
  } | null;
  playlist?: {
    id: string;
    name: string;
    spotifyPlaylistId?: string | null;
    genres?: string[];
  } | null;
  curator?: {
    id: string;
    name: string | null;
    email?: string | null;
    contactMethod?: string;
    consent?: boolean;
    canEmail?: boolean;
  } | null;
};

type PitchesApiResponse = {
  ok?: boolean;
  count?: number;
  pitches?: PitchRow[];
  error?: string;
  message?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString();
}

export default function PitchesPage() {
  const [loading, setLoading] = useState(true);
  const [pitches, setPitches] = useState<PitchRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<"ALL" | "SENT" | "DRAFT" | "QUEUED">("ALL");
  const [playlistId, setPlaylistId] = useState<string>("ALL");
  const [curatorId, setCuratorId] = useState<string>("ALL");

  async function load() {
    setLoading(true);
    setError(null);

    try {
      if (!ARTIST_ID) {
        throw new Error("Missing NEXT_PUBLIC_ARTIST_ID in .env.local");
      }

      const res = await fetch(`${API}/pitches`, {
        headers: {
          "x-artist-id": ARTIST_ID,
        },
        cache: "no-store",
      });

      const json: PitchesApiResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
      }

      setPitches(Array.isArray(json?.pitches) ? json.pitches : []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load pitches");
      setPitches([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const playlistOptions = useMemo(() => {
    const map = new Map<string, string>();

    for (const pitch of pitches) {
      const playlist = pitch.playlist;
      if (playlist?.id) {
        map.set(playlist.id, playlist.name || playlist.id);
      }
    }

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [pitches]);

  const curatorOptions = useMemo(() => {
    const map = new Map<string, string>();

    for (const pitch of pitches) {
      const curator = pitch.curator;
      if (curator?.id) {
        map.set(curator.id, curator.name || curator.id);
      }
    }

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [pitches]);

  const filtered = useMemo(() => {
    return pitches.filter((pitch) => {
      if (status !== "ALL" && pitch.status !== status) return false;
      if (playlistId !== "ALL" && pitch.playlist?.id !== playlistId) return false;
      if (curatorId !== "ALL" && pitch.curator?.id !== curatorId) return false;
      return true;
    });
  }, [pitches, status, playlistId, curatorId]);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Pitches</h1>

        <Link href="/dashboard" className="border px-4 py-2 rounded">
          ← Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="text-sm">
          <div className="text-gray-600 mb-1">Status</div>

          <select
            className="w-full border rounded p-2"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "ALL" | "SENT" | "DRAFT" | "QUEUED")
            }
          >
            <option value="ALL">All</option>
            <option value="SENT">SENT</option>
            <option value="QUEUED">QUEUED</option>
            <option value="DRAFT">DRAFT</option>
          </select>
        </label>

        <label className="text-sm">
          <div className="text-gray-600 mb-1">Playlist</div>

          <select
            className="w-full border rounded p-2"
            value={playlistId}
            onChange={(e) => setPlaylistId(e.target.value)}
          >
            <option value="ALL">All</option>

            {playlistOptions.map((playlist) => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <div className="text-gray-600 mb-1">Curator</div>

          <select
            className="w-full border rounded p-2"
            value={curatorId}
            onChange={(e) => setCuratorId(e.target.value)}
          >
            <option value="ALL">All</option>

            {curatorOptions.map((curator) => (
              <option key={curator.id} value={curator.id}>
                {curator.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={load}
          className="px-3 py-2 rounded bg-black text-white"
        >
          Refresh
        </button>
      </div>

      {loading ? <p>Loading…</p> : null}

      {error ? <p className="text-red-600">{error}</p> : null}

      {!loading && !error && filtered.length === 0 ? <p>No pitches yet.</p> : null}

      <div
  className="border rounded-lg overflow-x-scroll"
  style={{ scrollbarGutter: "stable" }}
>
  <table className="min-w-[1400px] text-left">
          <thead className="border-b bg-gray-100">
            <tr>
              <th className="p-3">Track</th>
              <th className="p-3">Playlist</th>
              <th className="p-3">Curator</th>
              <th className="p-3">Email</th>
              <th className="p-3">Sent To</th>
              <th className="p-3">Channel</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((pitch) => {
              const track = pitch.track;
              const playlist = pitch.playlist;
              const curator = pitch.curator;

              return (
                <tr key={pitch.id} className="border-b align-top">
                  <td className="p-3">{track?.title ?? "—"}</td>

                  <td className="p-3">{playlist?.name ?? "—"}</td>

                  <td className="p-3">{curator?.name ?? "—"}</td>

                  <td className="p-3">{curator?.email ?? "—"}</td>

                  <td className="p-3">{pitch.sentTo ?? "—"}</td>

                  <td className="p-3">{pitch.channel}</td>

                  <td className="p-3">{pitch.status}</td>

                  <td className="p-3">{formatDate(pitch.createdAt)}</td>

                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/pitches/${pitch.id}`}
                        className="inline-flex items-center rounded border px-3 py-1 text-sm hover:bg-gray-50"
                      >
                        Open
                      </Link>

                      {track?.id ? (
                        <Link
                          href={`/tracks/${track.id}`}
                          className="inline-flex items-center rounded border px-3 py-1 text-sm hover:bg-gray-50"
                        >
                          Track
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}