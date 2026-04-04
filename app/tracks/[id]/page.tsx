import Link from "next/link";

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

function normalizeMatches(data: MatchesResponse): MatchItem[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.matches)) return data.matches;
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

    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as MatchesResponse;
    return normalizeMatches(data);
  } catch {
    return [];
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
    const matches = await getMatches(track.id, artistId);

    const title = track.title || track.name || "Untitled track";
    const artists =
      Array.isArray(track.artists) && track.artists.length > 0
        ? track.artists.join(", ")
        : "—";
    const durationMs = track.durationMs ?? track.duration;
    const backendMatchCount = track.matchCount ?? track.matchesCount;
    const visibleMatchCount =
      typeof backendMatchCount === "number" ? backendMatchCount : matches.length;

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
            <p className="mt-4 text-sm text-gray-600">
              No matches found yet.
            </p>
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
                        {typeof match.fitScore === "number"
                          ? match.fitScore
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm text-gray-500">Explanation</p>
                    <p className="mt-1 text-sm">
                      {match.explanation?.trim() || "No explanation available."}
                    </p>
                  </div>
                </div>
              ))}
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