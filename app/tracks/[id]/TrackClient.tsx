"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

type TrackClientProps = {
  trackId: string;
};

type TrackResponse = {
  id: string;
  title?: string;
  name?: string;
  artists?: string[];
  durationMs?: number;
  duration?: number;
  spotifyTrackId?: string | null;
  spotifyUrl?: string | null;
  matchCount?: number;
  matchesCount?: number;
};

type MatchResponse = {
  id: string;
  trackId: string;
  playlistId: string;
  fitScore: number;
  explanation?: string | null;
  createdAt?: string;

  playlist: {
    id: string;
    name: string;
    spotifyPlaylistId?: string | null;
    genres?: string[];

    curator?: {
      id: string;
      name: string;
      email?: string | null;
      contactMethod?: string | null;
      consent?: boolean;
      languages?: string[];
      contactConfidence?: number | null;
      canEmail?: boolean;
    } | null;
  } | null;
};

type PitchResponse = {
  id: string;
  matchId: string;
  subject: string;
  body: string;
  status: string;
  channel: string;
  sentTo?: string | null;
};

type GeneratePitchResponse = {
  ok?: boolean;
  pitch?: PitchResponse;
  error?: string;
  message?: string;
};

type ApiErrorResponse = {
  error?: string;
  message?: string;
};

function formatDuration(ms?: number) {
  if (!ms || Number.isNaN(ms)) {
    return "—";
  }

  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function TrackClient({ trackId }: TrackClientProps) {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [track, setTrack] = useState<TrackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [selectedMatches, setSelectedMatches] = useState<string[]>([]);

  const [matching, setMatching] = useState(false);
const [matchMessage, setMatchMessage] = useState("");

const [generatingMatchId, setGeneratingMatchId] = useState<string | null>(
  null,
);

const [generatedPitches, setGeneratedPitches] = useState<
  Record<string, PitchResponse>
>({});

const [pitchErrors, setPitchErrors] = useState<Record<string, string>>({});

const [campaignResult, setCampaignResult] = useState<{
  selected: number;
  eligible: number;
  generated: number;
  sent: number;
  skippedAlreadySent: number;
  skippedNoEmail: number;
  skippedFakeEmail: number;
  failed: number;
} | null>(null);

const [launchingCampaign, setLaunchingCampaign] = useState(false);

const [sendingPitchId, setSendingPitchId] = useState<string | null>(null);

const [sentPitchIds, setSentPitchIds] = useState<Record<string, boolean>>({});

const [sendErrors, setSendErrors] = useState<Record<string, string>>({});

  const loadTrack = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Could not get authentication token.");
      }

      const response = await fetch(
        `${API_URL}/tracks/${encodeURIComponent(trackId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        },
      );

      const responseText = await response.text();

      let data: TrackResponse | ApiErrorResponse;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Server returned a non-JSON response (${response.status}).`,
        );
      }

      if (!response.ok) {
        const apiError = data as ApiErrorResponse;

        throw new Error(
          apiError.message ||
            apiError.error ||
            `Could not load track (${response.status}).`,
        );
      }

      setTrack(data as TrackResponse);

      const matchesResponse = await fetch(
  `${API_URL}/matches?trackId=${encodeURIComponent(trackId)}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  },
);

console.log("MATCHES STATUS:", matchesResponse.status);

if (matchesResponse.ok) {
  const contentType = matchesResponse.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const matchesData = await matchesResponse.json();

    console.log("MATCHES RESPONSE:", matchesData);

    const list = Array.isArray(matchesData)
      ? matchesData
      : Array.isArray(matchesData.matches)
        ? matchesData.matches
        : [];

    setMatches(list);
  } else {
    console.warn("Matches endpoint returned non-JSON.");
    setMatches([]);
  }
} else {
  console.warn(
    `Matches endpoint failed with status ${matchesResponse.status}`,
  );
  setMatches([]);
}

    } catch (err) {
      setTrack(null);

      setError(
        err instanceof Error ? err.message : "Could not load this track.",
      );
    } finally {
      setLoading(false);
    }
  }, [getToken, trackId]);

  async function startMatching() {
  try {
    setMatching(true);
    setMatchMessage("");

    const token = await getToken();

    if (!token) {
      throw new Error("Could not get authentication token.");
    }

    if (!track?.spotifyTrackId) {
      throw new Error("This track has no Spotify track ID.");
    }

    const response = await fetch(`${API_URL}/intake/track`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        spotifyTrackId: track.spotifyTrackId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Unable to start matching.",
      );
    }

    setMatchMessage("🎉 Matching started...");

    window.setTimeout(() => {
      void loadTrack();
    }, 3000);
  } catch (err) {
    setMatchMessage(
      err instanceof Error
        ? err.message
        : "Unable to start matching.",
    );
  } finally {
    setMatching(false);
  }
}

async function generatePitchForMatch(matchId: string) {
  try {
    setGeneratingMatchId(matchId);

    setPitchErrors((current) => ({
      ...current,
      [matchId]: "",
    }));

    const token = await getToken();

    if (!token) {
      throw new Error("Could not get authentication token.");
    }

    const response = await fetch(
      `${API_URL}/ai/generate-and-save-pitch`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId,
          channel: "EMAIL",
        }),
      },
    );

    const responseText = await response.text();

    let data: GeneratePitchResponse;

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Server returned a non-JSON response (${response.status}).`,
      );
    }

    if (!response.ok || !data.pitch) {
      throw new Error(
        data.message ||
          data.error ||
          "Could not generate this pitch.",
      );
    }

    setGeneratedPitches((current) => ({
      ...current,
      [matchId]: data.pitch as PitchResponse,
    }));
  } catch (err) {
    setPitchErrors((current) => ({
      ...current,
      [matchId]:
        err instanceof Error
          ? err.message
          : "Could not generate this pitch.",
    }));
  } finally {
    setGeneratingMatchId(null);
  }
}

async function sendPitch(pitchId: string) {
  try {
    setSendingPitchId(pitchId);

    setSendErrors((current) => ({
      ...current,
      [pitchId]: "",
    }));

    const token = await getToken();

    if (!token) {
      throw new Error("Could not get authentication token.");
    }

    const response = await fetch(
      `${API_URL}/pitches/${encodeURIComponent(pitchId)}/email`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const responseText = await response.text();

    let data: {
      ok?: boolean;
      pitch?: PitchResponse;
      error?: string;
      message?: string;
    };

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Server returned a non-JSON response (${response.status}).`,
      );
    }

    if (!response.ok || !data.pitch) {
      throw new Error(
        data.message ||
          data.error ||
          "Could not send this pitch.",
      );
    }

    setSentPitchIds((current) => ({
      ...current,
      [pitchId]: true,
    }));

    setGeneratedPitches((current) => ({
      ...current,
      [data.pitch!.matchId]: data.pitch as PitchResponse,
    }));
  } catch (err) {
    setSendErrors((current) => ({
      ...current,
      [pitchId]:
        err instanceof Error
          ? err.message
          : "Could not send this pitch.",
    }));
  } finally {
    setSendingPitchId(null);
  }
}

async function launchCampaign() {
  setLaunchingCampaign(true);

  try {
    if (selectedMatches.length === 0) {
      throw new Error("Select at least one playlist first.");
    }

    const token = await getToken();

    if (!token) {
      throw new Error("Could not get authentication token.");
    }

    const response = await fetch(
      `${API_URL}/pitches/launch-campaign`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackId,
          matchIds: selectedMatches,
        }),
      },
    );

    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Server returned a non-JSON response (${response.status}).`,
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          "Could not launch campaign.",
      );
    }

    console.log("LAUNCH CAMPAIGN RESULT:", data);

    setCampaignResult({
  selected: selectedMatches.length,
  eligible: data.eligibleMatches ?? 0,
  generated: data.generated ?? 0,
  sent: data.sent ?? 0,
  skippedAlreadySent: data.skippedAlreadySent ?? 0,
  skippedNoEmail: data.skippedNoEmail ?? 0,
  skippedFakeEmail: data.skippedFakeEmail ?? 0,
  failed: data.failed ?? 0,
});

    setSelectedMatches([]);

    await loadTrack();
  } catch (err) {
  alert(
    err instanceof Error
      ? err.message
      : "Could not launch campaign.",
  );
} finally {
  setLaunchingCampaign(false);
}
} 

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setError("You must be signed in.");
      setLoading(false);
      return;
    }

    void loadTrack();
  }, [isLoaded, isSignedIn, loadTrack]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-5 py-10 text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-emerald-400" />

            <p className="mt-5 font-bold text-white/70">
              Loading track workspace…
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !track) {
    return (
      <main className="min-h-screen bg-black px-5 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/dashboard"
            className="inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold transition hover:bg-white/10"
          >
            ← Back to dashboard
          </Link>

          <div className="mt-8 rounded-3xl border border-red-500/25 bg-red-500/10 p-7">
            <h1 className="text-2xl font-black">Failed to load track</h1>

            <p className="mt-3 text-sm text-red-300">
              {error || "Track not found."}
            </p>

            <button
              type="button"
              onClick={() => void loadTrack()}
              className="mt-6 cursor-pointer rounded-xl bg-white px-5 py-3 font-black text-black transition hover:bg-zinc-200"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const title = track.title || track.name || "Untitled track";

  const artistNames =
    Array.isArray(track.artists) && track.artists.length > 0
      ? track.artists
      : [];

  const artists =
    artistNames.length > 0 ? artistNames.join(", ") : "Unknown artist";

  const initials = artistNames
    .map((artist) => artist.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const duration = track.durationMs ?? track.duration;
  const matchCount = track.matchCount ?? track.matchesCount ?? 0;

  const spotifyUrl =
    track.spotifyUrl ||
    (track.spotifyTrackId
      ? `https://open.spotify.com/track/${track.spotifyTrackId}`
      : null);

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold transition hover:bg-white/10"
          >
            ← Dashboard
          </Link>

          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
            Track workspace
          </div>
        </div>

        <section className="relative mt-7 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-950 to-emerald-950 p-7 shadow-2xl sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_42%)]" />

          <div className="relative grid gap-8 lg:grid-cols-[220px_1fr] lg:items-center">
            <div className="flex aspect-square items-center justify-center rounded-[28px] border border-white/10 bg-gradient-to-br from-emerald-400 to-emerald-700 text-6xl font-black text-black shadow-2xl">
              {initials || "♪"}
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-400">
                Spotify campaign track
              </p>

              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
                {title}
              </h1>

              <p className="mt-4 text-lg text-white/60">{artists}</p>

              <div className="mt-7 flex flex-wrap gap-3">
                {spotifyUrl && (
                  <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#1ed760] px-6 py-3 font-black text-black transition hover:brightness-110"
                  >
                    <span>●</span>
                    Open on Spotify
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => void loadTrack()}
                  className="cursor-pointer rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-black transition hover:bg-white/10"
                >
                  Refresh data
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Matches"
            value={String(matchCount)}
            description="Relevant playlists"
          />

          <MetricCard
            label="Duration"
            value={formatDuration(duration)}
            description="Track length"
          />

          <MetricCard
            label="Pitches"
            value="0"
            description="Pitch drafts"
          />

          <MetricCard
            label="Placements"
            value="0"
            description="Detected additions"
          />
        </section>

        <section className="mt-7 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-emerald-400">
                  Audio profile
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Track analysis
                </h2>
              </div>

              <div className="rounded-2xl bg-white/5 px-4 py-3 text-2xl">
                🎚️
              </div>
            </div>

            <div className="mt-7 space-y-5">
              <FeatureRow label="Energy" value="Analysis pending" />
              <FeatureRow label="Danceability" value="Analysis pending" />
              <FeatureRow label="Tempo" value="Analysis pending" />
              <FeatureRow label="Mood" value="Analysis pending" />
            </div>

            <p className="mt-6 text-sm leading-6 text-white/40">
              Audio analysis will be connected to the matching engine in the
              next step.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-emerald-400">
                  Playlist matching
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Find the right curators
                </h2>
              </div>

              <div className="rounded-2xl bg-white/5 px-4 py-3 text-2xl">
                🎯
              </div>
            </div>

            {matchCount > 0 ? (
              <div className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                <p className="text-3xl font-black text-emerald-300">
                  {matchCount}
                </p>

                <p className="mt-1 text-sm text-white/55">
                  playlist matches are available for this track.
                </p>
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-6">
                <p className="font-bold">No matches generated yet</p>

                <p className="mt-2 text-sm leading-6 text-white/45">
                  Start matching to scan the TuneReach playlist database.
                </p>
              </div>
            )}

            <button
  type="button"
  onClick={startMatching}
  disabled={matching || !track.spotifyTrackId}
  className="mt-6 w-full rounded-2xl bg-emerald-400 px-6 py-4 font-black text-black transition hover:bg-emerald-300 disabled:opacity-50"
>
  {matching ? "Starting..." : "Start playlist matching"}
</button>

{matchMessage && (
  <p className="mt-4 text-sm text-emerald-300">
    {matchMessage}
  </p>
)}

{matches.length > 0 && (
  <div className="mt-6 space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-black">Top playlist matches</h3>

      <span className="text-sm text-white/40">
        Showing {Math.min(matches.length, 10)} of {matches.length}
      </span>
    </div>

    {matches.slice(0, 10).map((match) => (
      <div
        key={match.id}
        className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
      >
        {/* SELECT CHECKBOX */}
        <div className="mb-4 flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedMatches.includes(match.id)}
            onChange={(event) => {
              if (event.target.checked) {
                setSelectedMatches((current) =>
                  current.includes(match.id)
                    ? current
                    : [...current, match.id],
                );
              } else {
                setSelectedMatches((current) =>
                  current.filter((id) => id !== match.id),
                );
              }
            }}
            className="h-5 w-5 cursor-pointer accent-emerald-400"
          />

          <span className="text-sm font-bold text-emerald-300">
            Select for campaign
          </span>
        </div>

        {/* PLAYLIST INFO */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h4 className="truncate font-black">
              {match.playlist?.name || "Untitled playlist"}
            </h4>

            <p className="mt-1 text-sm text-white/45">
              Curator: {match.playlist?.curator?.name || "Unknown"}
            </p>

            {match.playlist?.curator?.canEmail && (
              <p className="mt-2 text-xs font-bold text-emerald-300">
                Email available
              </p>
            )}

            {Array.isArray(match.playlist?.genres) &&
              match.playlist.genres.length > 0 && (
                <p className="mt-2 text-xs text-white/35">
                  {match.playlist.genres.slice(0, 4).join(" • ")}
                </p>
              )}
          </div>

          <div className="text-right">
            <p className="text-xl font-black text-emerald-300">
              {Math.round(
                match.fitScore <= 1
                  ? match.fitScore * 100
                  : match.fitScore,
              )}
              %
            </p>

            <p className="mt-1 text-xs text-white/35">
              match score
            </p>
          </div>
        </div>

        {/* SPOTIFY LINK */}
        {match.playlist?.spotifyPlaylistId && (
          <a
            href={`https://open.spotify.com/playlist/${match.playlist.spotifyPlaylistId}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex text-sm font-bold text-emerald-300 hover:text-emerald-200"
          >
            Open playlist ↗
          </a>
        )}

        {/* AI PITCH */}
        <div className="mt-5 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={() => void generatePitchForMatch(match.id)}
            disabled={generatingMatchId === match.id}
            className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generatingMatchId === match.id
              ? "Generating AI pitch…"
              : generatedPitches[match.id]
                ? "Generate again"
                : "✨ Generate AI Pitch"}
          </button>

          {pitchErrors[match.id] && (
            <p className="mt-3 text-sm text-red-300">
              {pitchErrors[match.id]}
            </p>
          )}

          {generatedPitches[match.id] && (
            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                Saved draft
              </p>

              <p className="mt-4 text-sm text-white/45">
                Subject
              </p>

              <p className="mt-1 font-black">
                {generatedPitches[match.id].subject}
              </p>

              <p className="mt-5 text-sm text-white/45">
                Message
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/70">
                {generatedPitches[match.id].body}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-white/55">
                  {generatedPitches[match.id].status}
                </span>

                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-white/55">
                  {generatedPitches[match.id].channel}
                </span>
              </div>

              {/* SEND SINGLE PITCH */}
              <div className="mt-5 border-t border-emerald-400/15 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    void sendPitch(generatedPitches[match.id].id)
                  }
                  disabled={
                    sendingPitchId === generatedPitches[match.id].id ||
                    sentPitchIds[generatedPitches[match.id].id] === true
                  }
                  className="rounded-xl bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sendingPitchId === generatedPitches[match.id].id
                    ? "Sending pitch…"
                    : sentPitchIds[generatedPitches[match.id].id]
                      ? "✓ Pitch sent"
                      : "📧 Send Pitch"}
                </button>

                {sendErrors[generatedPitches[match.id].id] && (
                  <p className="mt-3 text-sm text-red-300">
                    {sendErrors[generatedPitches[match.id].id]}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    ))}

    {/* SELECTED CAMPAIGN SUMMARY */}
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div>
        <p className="font-black">
          Selected playlists: {selectedMatches.length}
        </p>

        <p className="mt-1 text-sm text-white/40">
          Only selected playlists will be used for this campaign.
        </p>
      </div>

      <button
  type="button"
  onClick={() => void launchCampaign()}
  disabled={selectedMatches.length === 0}
  className="rounded-xl bg-emerald-400 px-6 py-3 font-black text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
>
  🚀 Launch Selected Campaign
</button>
    </div>
  </div>
)}
          </div>
        </section>

        <section className="mt-7 rounded-3xl border border-white/10 bg-zinc-950 p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-bold text-emerald-400">
                Campaign workspace
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Turn this track into a campaign
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-white/45">
                Generate personalized pitches, contact relevant curators and
                monitor opens, clicks and playlist placements.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <p className="text-xs uppercase tracking-wide text-white/35">
                Track ID
              </p>

              <p className="mt-1 max-w-64 truncate text-sm font-bold">
                {track.id}
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <CampaignStep
              number="01"
              title="Generate matches"
              text="Find playlists that fit the track."
            />

            <CampaignStep
              number="02"
              title="Create AI pitches"
              text="Prepare personalized curator outreach."
            />

            <CampaignStep
              number="03"
              title="Launch campaign"
              text="Send and track the complete campaign."
            />
          </div>

          <button
  type="button"
  onClick={() => void launchCampaign()}
  disabled={launchingCampaign}
  className="mt-7 rounded-2xl bg-emerald-400 px-8 py-4 font-black text-black transition hover:bg-emerald-300 disabled:opacity-50"
>
  {launchingCampaign
    ? "🚀 Launching campaign..."
    : "🚀 Launch campaign →"}
</button>

{campaignResult && (
  <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6">
    <h3 className="text-2xl font-black text-emerald-300">
      ✅ Campaign completed
    </h3>

    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Selected"
        value={String(campaignResult.selected)}
        description="Playlists"
      />

      <MetricCard
        label="Generated"
        value={String(campaignResult.generated)}
        description="AI pitches"
      />

      <MetricCard
        label="Sent"
        value={String(campaignResult.sent)}
        description="Emails"
      />

      <MetricCard
        label="Failed"
        value={String(campaignResult.failed)}
        description="Errors"
      />
    </div>

    <div className="mt-6 space-y-2 text-sm text-white/60">
      <p>Already sent: {campaignResult.skippedAlreadySent}</p>
      <p>No email available: {campaignResult.skippedNoEmail}</p>
      <p>Skipped fake emails: {campaignResult.skippedFakeEmail}</p>
      <p>Eligible playlists: {campaignResult.eligible}</p>
    </div>
  </div>
)}

</section>
</div>
</main>
);
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
      <p className="text-sm text-white/40">{label}</p>
      <p className="mt-3 text-4xl font-black">{value}</p>
      <p className="mt-2 text-sm text-white/35">{description}</p>
    </div>
  );
}

function FeatureRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-white/10 pb-4 last:border-b-0">
      <span className="text-white/45">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function CampaignStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <p className="font-black text-emerald-400">{number}</p>
      <h3 className="mt-3 text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/40">{text}</p>
    </div>
  );
}