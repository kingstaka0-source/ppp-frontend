import Link from "next/link";
import PitchButton from "@/app/components/PitchButton";
import SendAllPitchesButton from "@/app/components/SendAllPitchesButton";
import LaunchCampaignButton from "./LaunchCampaignButton";

export const dynamic = "force-dynamic";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

function msToMinSec(ms?: number | null) {
  const totalMs = typeof ms === "number" && Number.isFinite(ms) ? ms : 0;
  const s = Math.floor(totalMs / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function safeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

type TrackDetail = {
  id?: string | null;
  spotifyTrackId?: string | null;
  title?: string | null;
  artists?: string[] | null;
  durationMs?: number | null;
  createdAt?: string | null;
  audioFeatures?: unknown;
  matchCount?: number | null;
};

type MatchRow = {
  id?: string | null;
  playlistId?: string | null;
  trackId?: string | null;
  fitScore?: number | null;
  explanation?: string | null;
  createdAt?: string | null;
  playlist?: {
    id?: string | null;
    name?: string | null;
    spotifyPlaylistId?: string | null;
    genres?: string[] | null;
    curator?: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      contactMethod?: "EMAIL" | "INAPP" | string | null;
      consent?: boolean | null;
      languages?: string[] | null;
      canEmail?: boolean | null;
    } | null;
  } | null;
};

type PitchApiItem = {
  id?: string | null;
  matchId?: string | null;
  status?: string | null;
  createdAt?: string | null;
  match?: {
    id?: string | null;
    playlistId?: string | null;
    trackId?: string | null;
  } | null;
};

type PitchesApiRes = {
  ok?: boolean;
  pitches?: PitchApiItem[] | null;
};

async function apiJson(url: string) {
  const headers: Record<string, string> = {};
  if (ARTIST_ID) {
    headers["x-artist-id"] = ARTIST_ID;
  }

  const response = await fetch(url, {
    cache: "no-store",
    headers,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      json?.error || json?.message || `HTTP ${response.status}`
    );
  }

  return json;
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "green" | "yellow" | "red" | "neutral";
}) {
  const classes =
    tone === "green"
      ? "bg-green-100 text-green-800 border-green-300"
      : tone === "yellow"
      ? "bg-yellow-100 text-yellow-800 border-yellow-300"
      : tone === "red"
      ? "bg-red-100 text-red-800 border-red-300"
      : "bg-gray-100 text-gray-700 border-gray-300";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${classes}`}
    >
      {children}
    </span>
  );
}

export default async function TrackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: trackId } = await params;

  if (!ARTIST_ID) {
    return (
      <div className="max-w-5xl mx-auto p-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold">Track</h1>
            <p className="mt-2 text-sm text-gray-600">
              Could not load this page because NEXT_PUBLIC_ARTIST_ID is missing.
            </p>
          </div>

          <Link href="/dashboard" className="px-4 py-2 rounded border border-black">
            ← Dashboard
          </Link>
        </div>

        <div className="border rounded p-4 bg-yellow-50 text-sm text-yellow-900">
          Add <strong>NEXT_PUBLIC_ARTIST_ID</strong> to <strong>.env.local</strong> and
          restart the frontend.
        </div>
      </div>
    );
  }

  let track: TrackDetail | null = null;
  let matches: MatchRow[] = [];
  let pitchApi: PitchesApiRes = {};
  let loadError = "";

  try {
    const [trackRes, matchesRes, pitchesRes] = await Promise.all([
      apiJson(`${API}/tracks/${trackId}`),
      apiJson(`${API}/matches?trackId=${trackId}`),
      apiJson(`${API}/pitches?trackId=${trackId}`),
    ]);

    track = trackRes as TrackDetail;

    if (Array.isArray(matchesRes)) {
      matches = matchesRes as MatchRow[];
    } else if (Array.isArray(matchesRes?.matches)) {
      matches = matchesRes.matches as MatchRow[];
    } else {
      matches = [];
    }

    pitchApi = (pitchesRes as PitchesApiRes) ?? {};
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load track page.";
  }

  if (loadError) {
    return (
      <div className="max-w-5xl mx-auto p-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold">Track</h1>
            <p className="mt-2 text-sm text-gray-600">
              Could not load this track page.
            </p>
          </div>

          <Link href="/dashboard" className="px-4 py-2 rounded border border-black">
            ← Dashboard
          </Link>
        </div>

        <div className="border rounded p-4 bg-red-50 text-sm text-red-700">
          <strong>Could not load track page.</strong>
          <div className="mt-1">{loadError}</div>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="max-w-5xl mx-auto p-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold">Track</h1>
            <p className="mt-2 text-sm text-gray-600">Track not found.</p>
          </div>

          <Link href="/dashboard" className="px-4 py-2 rounded border border-black">
            ← Dashboard
          </Link>
        </div>

        <div className="border rounded p-4 text-sm text-gray-500">
          No track data was returned.
        </div>
      </div>
    );
  }

  const pitches = Array.isArray(pitchApi?.pitches) ? pitchApi.pitches : [];

  const pitchedMatchIds = new Set(
    pitches.map((p) => p.matchId).filter(Boolean) as string[]
  );

  const pitchedPlaylistIds = new Set(
    pitches.map((p) => p.match?.playlistId).filter(Boolean) as string[]
  );

  const spotifyUrl = track.spotifyTrackId
    ? `https://open.spotify.com/track/${track.spotifyTrackId}`
    : null;

  const sendableCount = matches.filter(
    (m) => m.playlist?.curator?.canEmail === true
  ).length;

  const trackTitle = track.title?.trim() || "Track";
  const artists =
    track.artists && track.artists.length > 0 ? track.artists.join(", ") : "—";
  const duration = msToMinSec(track.durationMs);
  const matchCount = safeNumber(track.matchCount);

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold">{trackTitle}</h1>

          <div className="mt-2 text-sm text-gray-700">
            {artists} • {duration} • Matches: {matchCount}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="neutral">Total matches: {matches.length}</Badge>
            <Badge tone={sendableCount > 0 ? "green" : "yellow"}>
              Sendable: {sendableCount}
            </Badge>
            <Badge tone="neutral">Pitches: {pitches.length}</Badge>
          </div>

          {spotifyUrl ? (
            <div className="mt-3">
              <a
                className="text-sm underline"
                href={spotifyUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open in Spotify →
              </a>
            </div>
          ) : null}
        </div>

        <div className="flex gap-3 flex-wrap">
          <SendAllPitchesButton trackId={trackId} />
          <LaunchCampaignButton trackId={trackId} />
          <Link href="/dashboard" className="px-4 py-2 rounded border border-black">
            ← Dashboard
          </Link>
        </div>
      </div>

      {process.env.NODE_ENV !== "production" ? (
        <details className="text-xs">
          <summary className="cursor-pointer">Debug</summary>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(
              {
                trackId,
                artistId: ARTIST_ID,
                pitchesCount: pitches.length,
                sendableCount,
              },
              null,
              2
            )}
          </pre>
        </details>
      ) : null}

      <div className="border rounded-xl p-6 space-y-4">
        <h2 className="text-2xl font-bold">Matches</h2>

        {matches.length === 0 ? (
          <div className="text-sm text-gray-500">No matches found yet.</div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, index) => {
              const matchId = match.id ?? `match-${index}`;
              const playlistId = match.playlistId ?? "";
              const playlistName =
                match.playlist?.name?.trim() || playlistId || "Unknown playlist";
              const curator = match.playlist?.curator;
              const curatorName = curator?.name || "—";
              const curatorEmail = curator?.email || "—";
              const contactMethod = curator?.contactMethod || "—";
              const consent = curator?.consent === true;
              const canEmail = curator?.canEmail === true;
              const explanation = match.explanation || "—";
              const fitScore =
                typeof match.fitScore === "number" ? match.fitScore : "—";

              const already =
                (!!match.id && pitchedMatchIds.has(match.id)) ||
                (!!playlistId && pitchedPlaylistIds.has(playlistId));

              return (
                <div key={matchId} className="border rounded p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="font-bold text-lg">{playlistName}</div>
                      <div>Score: {fitScore}</div>
                      <div className="text-sm text-gray-600">{explanation}</div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                      <Badge tone={canEmail ? "green" : "yellow"}>
                        {canEmail ? "Sendable" : "Not sendable"}
                      </Badge>

                      <Badge
                        tone={contactMethod === "EMAIL" ? "green" : "neutral"}
                      >
                        {contactMethod}
                      </Badge>

                      <Badge tone={consent ? "green" : "red"}>
                        {consent ? "Consent yes" : "Consent no"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-gray-500">Curator</div>
                      <div>{curatorName}</div>
                    </div>

                    <div>
                      <div className="text-gray-500">Email</div>
                      <div className="break-all">{curatorEmail}</div>
                    </div>

                    <div>
                      <div className="text-gray-500">Playlist ID</div>
                      <div className="break-all">
                        {match.playlist?.spotifyPlaylistId || "—"}
                      </div>
                    </div>
                  </div>

                  {match.playlist?.genres && match.playlist.genres.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {match.playlist.genres.map((genre, genreIndex) => (
                        <Badge key={`${genre}-${genreIndex}`}>{genre}</Badge>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-3">
                    {match.id ? (
                      <PitchButton matchId={match.id} already={already} />
                    ) : (
                      <div className="text-sm text-gray-500">
                        Match id missing.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}