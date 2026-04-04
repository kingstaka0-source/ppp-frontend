import Link from "next/link";
import GeneratePitchButton from "@/app/components/GeneratePitchButton";
import SendPitchButton from "@/app/components/SendPitchButton";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ artistId?: string | string[] }>;
};

type TrackResponse = {
  id: string;
  title?: string;
  name?: string;
  artists?: string[];
  durationMs?: number;
  duration?: number;
  spotifyTrackId?: string | null;
  matchCount?: number;
  matchesCount?: number;
};

type MatchItem = {
  id: string;
  fitScore?: number | null;
  explanation?: string | null;
  playlist?: {
    id: string;
    name?: string | null;
  } | null;
};

type MatchesResponse = MatchItem[] | { matches?: MatchItem[] };

type PitchItem = {
  id: string;
  subject?: string | null;
  body?: string | null;
  status?: "DRAFT" | "QUEUED" | "SENT" | string | null;
  channel?: "INAPP" | "EMAIL" | string | null;
  sentTo?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  match?: {
    id: string;
    playlist?: {
      id: string;
      name?: string | null;
    } | null;
  } | null;
  playlist?: {
    id: string;
    name?: string | null;
  } | null;
};

type PitchesResponse = PitchItem[] | { pitches?: PitchItem[] };

type BillingAccessResponse = {
  plan?: string;
  canLaunchCampaign?: boolean;
  canBulkQueue?: boolean;
  canAutoSend?: boolean;
  canSendEmails?: boolean;
  canCreatePitch?: boolean;
};

function getSingleParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function formatDuration(ms?: number) {
  if (!ms || Number.isNaN(ms)) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function truncate(text?: string | null, max = 220) {
  if (!text) return "—";
  const clean = text.trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max)}...`;
}

function normalizeMatches(data: MatchesResponse): MatchItem[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.matches)) return data.matches;
  return [];
}

function normalizePitches(data: PitchesResponse): PitchItem[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.pitches)) return data.pitches;
  return [];
}

async function getTrack(id: string, artistId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is missing");

  const url = `${baseUrl}/tracks/${encodeURIComponent(id)}?artistId=${encodeURIComponent(
    artistId
  )}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-artist-id": artistId,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to load track (${res.status})`);
  }

  return (await res.json()) as TrackResponse;
}

async function getMatches(trackId: string, artistId: string): Promise<MatchItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return [];

  const url = `${baseUrl}/matches?trackId=${encodeURIComponent(
    trackId
  )}&artistId=${encodeURIComponent(artistId)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-artist-id": artistId,
      },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = (await res.json()) as MatchesResponse;
    return normalizeMatches(data);
  } catch {
    return [];
  }
}

async function getPitches(trackId: string, artistId: string): Promise<PitchItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return [];

  const url = `${baseUrl}/pitches?trackId=${encodeURIComponent(
    trackId
  )}&artistId=${encodeURIComponent(artistId)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-artist-id": artistId,
      },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = (await res.json()) as PitchesResponse;
    return normalizePitches(data);
  } catch {
    return [];
  }
}

async function getBillingAccess(
  artistId: string
): Promise<BillingAccessResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return null;

  const url = `${baseUrl}/billing/access?artistId=${encodeURIComponent(artistId)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-artist-id": artistId,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    return (await res.json()) as BillingAccessResponse;
  } catch {
    return null;
  }
}

export default async function TrackDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const artistId =
    getSingleParam(resolvedSearchParams?.artistId) ||
    process.env.NEXT_PUBLIC_ARTIST_ID ||
    "";

  if (!artistId) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <div className="rounded-2xl border p-6">
          <h1 className="text-2xl font-semibold">Track not available</h1>
          <p className="mt-3 text-sm text-gray-600">
            Missing artistId in query string and no default artist is set.
          </p>

          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex rounded-xl border px-4 py-2 text-sm font-medium"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  try {
    const track = await getTrack(id, artistId);
    const [matches, pitches, billing] = await Promise.all([
      getMatches(track.id, artistId),
      getPitches(track.id, artistId),
      getBillingAccess(artistId),
    ]);

    const title = track.title || track.name || "Untitled track";
    const artists =
      Array.isArray(track.artists) && track.artists.length > 0
        ? track.artists.join(", ")
        : "—";
    const durationMs = track.durationMs ?? track.duration;
    const backendMatchCount = track.matchCount ?? track.matchesCount;
    const visibleMatchCount =
      typeof backendMatchCount === "number" ? backendMatchCount : matches.length;

    const plan = billing?.plan || "UNKNOWN";
    const canCreatePitch = billing?.canCreatePitch !== false;
    const canSendEmails = billing?.canSendEmails === true;

    return (
      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/dashboard?artistId=${encodeURIComponent(artistId)}`}
            className="inline-flex rounded-xl border px-4 py-2 text-sm font-medium"
          >
            ← Back to dashboard
          </Link>

          <div className="rounded-xl border px-3 py-2 text-sm">
            Plan: <span className="font-semibold">{plan}</span>
          </div>
        </div>

        <div className="rounded-2xl border p-6 shadow-sm">
          <h1 className="text-3xl font-bold">{title}</h1>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Artists
              </p>
              <p className="mt-2 text-base font-medium">{artists}</p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Duration
              </p>
              <p className="mt-2 text-base font-medium">
                {formatDuration(durationMs)}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Match count
              </p>
              <p className="mt-2 text-base font-medium">{visibleMatchCount}</p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Track ID
              </p>
              <p className="mt-2 break-all text-sm font-medium">{track.id}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Matches</h2>

          {matches.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No matches found yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {matches.map((match) => (
                <div key={match.id} className="rounded-xl border p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Playlist</p>
                      <p className="text-base font-semibold">
                        {match.playlist?.name || "Unnamed playlist"}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-sm text-gray-500">Fit score</p>
                      <p className="text-base font-semibold">
                        {typeof match.fitScore === "number" ? match.fitScore : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm text-gray-500">Explanation</p>
                    <p className="mt-1 text-sm">
                      {match.explanation?.trim() || "No explanation available."}
                    </p>
                  </div>

                  <GeneratePitchButton
                    matchId={match.id}
                    artistId={artistId}
                    disabled={!canCreatePitch}
                  />

                  {!canCreatePitch ? (
                    <p className="mt-2 text-xs text-gray-600">
                      Upgrade required to generate more pitches.
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Pitches</h2>

          {pitches.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No pitches found yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {pitches.map((pitch) => {
                const playlistName =
                  pitch.playlist?.name ||
                  pitch.match?.playlist?.name ||
                  "Unknown playlist";

                return (
                  <div key={pitch.id} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Subject</p>
                        <p className="text-base font-semibold">
                          {pitch.subject?.trim() || "Untitled pitch"}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="text-base font-semibold">
                          {pitch.status || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-sm text-gray-500">Playlist</p>
                        <p className="mt-1 text-sm font-medium">{playlistName}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Channel</p>
                        <p className="mt-1 text-sm font-medium">
                          {pitch.channel || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Sent to</p>
                        <p className="mt-1 break-all text-sm font-medium">
                          {pitch.sentTo || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-gray-500">Body</p>
                      <p className="mt-1 text-sm">
                        {truncate(pitch.body, 260)}
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-gray-500">Updated</p>
                      <p className="mt-1 text-sm">{formatDate(pitch.updatedAt)}</p>
                    </div>

                    <SendPitchButton
                      pitchId={pitch.id}
                      artistId={artistId}
                      disabled={!canSendEmails || pitch.status === "SENT"}
                    />

                    {!canSendEmails ? (
                      <p className="mt-2 text-xs text-gray-600">
                        Upgrade required to send emails.
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error loading track";

    return (
      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-6">
          <Link
            href={`/dashboard?artistId=${encodeURIComponent(artistId)}`}
            className="inline-flex rounded-xl border px-4 py-2 text-sm font-medium"
          >
            ← Back to dashboard
          </Link>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-2xl font-semibold">Failed to load track</h1>
          <p className="mt-3 whitespace-pre-wrap break-words text-sm text-red-700">
            {message}
          </p>
        </div>
      </main>
    );
  }
}