import Link from "next/link";

export const dynamic = "force-dynamic";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

const ARTIST_ID =
  process.env.NEXT_PUBLIC_ARTIST_ID || "";

type Track = {
  id: string;
  artistId: string;

  spotifyTrackId: string;
  spotifyAlbumId: string | null;
  spotifyUrl: string | null;

  title: string;
  artists: string[];

  albumName: string | null;
  albumImageUrl: string | null;
  releaseDate: string | null;

  isrc: string | null;
  trackNumber: number | null;
  discNumber: number | null;
  explicit: boolean;

  durationMs: number;
  createdAt: string;
  updatedAt: string;

  matchCount: number;
};

function msToMinSec(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatReleaseDate(date: string | null) {
  if (!date) return "Unknown";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function getTracks(): Promise<Track[]> {
  const response = await fetch(`${API}/tracks`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Tracks ophalen mislukt: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter((track: Track) => {
    return !ARTIST_ID || track.artistId === ARTIST_ID;
  });
}

export default async function TracksPage() {
  if (!ARTIST_ID) {
    return (
      <main className="mx-auto max-w-7xl p-6 md:p-8">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          Missing <strong>NEXT_PUBLIC_ARTIST_ID</strong> in{" "}
          <code>.env.local</code>.
        </div>
      </main>
    );
  }

  let tracks: Track[] = [];
  let errorMessage = "";

  try {
    tracks = await getTracks();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "De tracks konden niet worden geladen.";
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            Muziekcatalogus
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            Mijn tracks
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Bekijk je Spotify-releases, metadata en het aantal gevonden
            playlistmatches.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex w-fit items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-gray-950 hover:bg-gray-950 hover:text-white"
        >
          ← Dashboard
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Totaal tracks" value={tracks.length} />

        <StatCard
          label="Met artwork"
          value={tracks.filter((track) => track.albumImageUrl).length}
        />

        <StatCard
          label="Totale matches"
          value={tracks.reduce(
            (total, track) => total + (track.matchCount ?? 0),
            0
          )}
        />

        <StatCard
          label="Spotify gekoppeld"
          value={tracks.filter((track) => track.spotifyUrl).length}
        />
      </section>

      {errorMessage ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          <h2 className="font-semibold">Tracks konden niet worden geladen</h2>
          <p className="mt-1 text-sm">{errorMessage}</p>
        </section>
      ) : tracks.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-950">
            Nog geen tracks gevonden
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Importeer eerst je Spotify-catalogus.
          </p>
        </section>
      ) : (
        <>
          <section className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Track</th>
                    <th className="px-5 py-4">Album</th>
                    <th className="px-5 py-4">Release</th>
                    <th className="px-5 py-4 text-center">Duur</th>
                    <th className="px-5 py-4 text-center">Matches</th>
                    <th className="px-5 py-4 text-right">Acties</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {tracks.map((track) => (
                    <tr
                      key={track.id}
                      className="transition hover:bg-gray-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-4">
                          <TrackArtwork track={track} />

                          <div className="min-w-0">
                            <Link
                              href={`/tracks/${track.id}`}
                              className="block truncate font-semibold text-gray-950 hover:underline"
                            >
                              {track.title}
                            </Link>

                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                              <span className="truncate">
                                {(track.artists ?? []).join(", ") ||
                                  "Unknown artist"}
                              </span>

                              {track.explicit ? (
                                <span className="rounded bg-gray-200 px-1.5 py-0.5 font-semibold text-gray-700">
                                  E
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="max-w-[220px] px-5 py-4">
                        <div className="truncate text-gray-700">
                          {track.albumName || "Unknown album"}
                        </div>

                        {track.isrc ? (
                          <div className="mt-1 truncate font-mono text-xs text-gray-400">
                            {track.isrc}
                          </div>
                        ) : null}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                        {formatReleaseDate(track.releaseDate)}
                      </td>

                      <td className="px-5 py-4 text-center font-mono text-gray-700">
                        {msToMinSec(track.durationMs)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex min-w-10 justify-center rounded-full bg-gray-950 px-3 py-1 text-xs font-bold text-white">
                          {track.matchCount ?? 0}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {track.spotifyUrl ? (
                            <a
                              href={track.spotifyUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center rounded-lg border border-[#1DB954] px-3 py-2 text-xs font-semibold text-[#14833b] transition hover:bg-[#1DB954] hover:text-white"
                            >
                              Spotify
                            </a>
                          ) : null}

                          <Link
                            href={`/tracks/${track.id}`}
                            className="inline-flex items-center rounded-lg bg-gray-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-700"
                          >
                            Bekijken →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 md:hidden">
            {tracks.map((track) => (
              <article
                key={track.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex gap-4">
                  <TrackArtwork track={track} />

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/tracks/${track.id}`}
                      className="block truncate text-base font-bold text-gray-950"
                    >
                      {track.title}
                    </Link>

                    <p className="mt-1 truncate text-sm text-gray-600">
                      {(track.artists ?? []).join(", ") || "Unknown artist"}
                    </p>

                    <p className="mt-1 truncate text-xs text-gray-500">
                      {track.albumName || "Unknown album"}
                    </p>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4 text-center">
                  <div>
                    <dt className="text-xs text-gray-500">Release</dt>
                    <dd className="mt-1 text-xs font-semibold text-gray-900">
                      {formatReleaseDate(track.releaseDate)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-gray-500">Duur</dt>
                    <dd className="mt-1 font-mono text-xs font-semibold text-gray-900">
                      {msToMinSec(track.durationMs)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-gray-500">Matches</dt>
                    <dd className="mt-1 text-xs font-bold text-gray-900">
                      {track.matchCount ?? 0}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex gap-2">
                  {track.spotifyUrl ? (
                    <a
                      href={track.spotifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 rounded-xl border border-[#1DB954] px-3 py-2.5 text-center text-sm font-semibold text-[#14833b]"
                    >
                      Spotify
                    </a>
                  ) : null}

                  <Link
                    href={`/tracks/${track.id}`}
                    className="flex-1 rounded-xl bg-gray-950 px-3 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Bekijken
                  </Link>
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      <footer className="text-xs text-gray-500">
        Showing {tracks.length} track{tracks.length === 1 ? "" : "s"} for
        artist <span className="font-mono">{ARTIST_ID}</span>
      </footer>
    </main>
  );
}

function TrackArtwork({ track }: { track: Track }) {
  if (track.albumImageUrl) {
    return (
      <img
        src={track.albumImageUrl}
        alt={`Artwork van ${track.title}`}
        className="h-14 w-14 shrink-0 rounded-xl object-cover shadow-sm"
      />
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl text-gray-400">
      ♪
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
        {value.toLocaleString("nl-NL")}
      </p>
    </div>
  );
}