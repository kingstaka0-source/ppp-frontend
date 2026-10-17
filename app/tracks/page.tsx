import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";


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
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("Authentication required.");
  }

  const response = await fetch(`${API}/tracks`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
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

  return data;
}

export default async function TracksPage() {
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
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-white/10 bg-[#090b0b] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <Link href="/dashboard" className="inline-flex">
                <img
                  src="/brand/logo.svg"
                  alt="TuneReach"
                  className="h-9 w-auto"
                />
              </Link>

              <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                Tracks Workspace
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                My Tracks
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                Manage your Spotify catalog and open a track to review playlist
                matches and campaign opportunities.
              </p>
            </div>

            <nav className="flex shrink-0 flex-wrap items-center gap-2">
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-white/65 transition hover:bg-white/[0.08] hover:text-white"
              >
                Dashboard
              </Link>

              <Link
                href="/tracks"
                className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-2 text-sm font-black text-emerald-300 transition hover:bg-emerald-400/20"
              >
                Tracks
              </Link>

              <Link
                href="/pitches"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-white/65 transition hover:bg-white/[0.08] hover:text-white"
              >
                Pitches
              </Link>

              <Link
                href="/followups"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-white/65 transition hover:bg-white/[0.08] hover:text-white"
              >
                Follow-ups
              </Link>

              <Link
                href="/curators"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-white/65 transition hover:bg-white/[0.08] hover:text-white"
              >
                Curators
              </Link>

              <Link
                href="/campaigns"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-white/65 transition hover:bg-white/[0.08] hover:text-white"
              >
                Campaigns
              </Link>
            </nav>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatCard label="Total tracks" value={tracks.length} />

          <StatCard
            label="With artwork"
            value={tracks.filter((track) => track.albumImageUrl).length}
          />

          <StatCard
            label="Playlist matches"
            value={tracks.reduce(
              (total, track) => total + (track.matchCount ?? 0),
              0
            )}
          />

          <StatCard
            label="Spotify linked"
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
            No tracks found yet
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Import your Spotify catalog first.
          </p>
        </section>
      ) : (
        <>
          <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0f]">
            <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                  Music Catalog
                </p>

                <h2 className="mt-2 text-xl font-black tracking-tight text-white">
                  Your Spotify tracks
                </h2>

                <p className="mt-1 text-sm text-white/45">
                  Open a track workspace to review matches, pitches and campaign opportunities.
                </p>
              </div>

              <div className="text-sm font-bold text-white/45">
                {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/[0.025] text-[11px] font-black uppercase tracking-[0.14em] text-white/35">
                  <tr>
                    <th className="px-5 py-3.5 sm:px-6">Track</th>
                    <th className="px-5 py-3.5">Album</th>
                    <th className="px-5 py-3.5">Release</th>
                    <th className="px-5 py-3.5 text-center">Duration</th>
                    <th className="px-5 py-3.5 text-center">Matches</th>
                    <th className="px-5 py-3.5 text-right sm:px-6">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.07]">
                  {tracks.map((track) => {
                    const matchCount = track.matchCount ?? 0;

                    return (
                      <tr
                        key={track.id}
                        className="transition hover:bg-white/[0.035]"
                      >
                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex min-w-0 items-center gap-3.5">
                            <TrackArtwork track={track} />

                            <div className="min-w-0">
                              <Link
                                href={`/tracks/${track.id}`}
                                className="block truncate font-black text-white transition hover:text-emerald-300"
                              >
                                {track.title}
                              </Link>

                              <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-white/40">
                                <span className="truncate">
                                  {(track.artists ?? []).join(", ") ||
                                    "Unknown artist"}
                                </span>

                                {track.explicit ? (
                                  <span className="shrink-0 rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-black text-white/55">
                                    E
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="max-w-[230px] px-5 py-4">
                          <div className="truncate font-medium text-white/65">
                            {track.albumName || "Unknown album"}
                          </div>

                          {track.isrc ? (
                            <div className="mt-1 truncate font-mono text-[11px] text-white/25">
                              {track.isrc}
                            </div>
                          ) : null}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-white/55">
                          {formatReleaseDate(track.releaseDate)}
                        </td>

                        <td className="px-5 py-4 text-center font-mono text-white/55">
                          {msToMinSec(track.durationMs)}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span
                            className={
                              matchCount > 0
                                ? "inline-flex min-w-10 justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300"
                                : "inline-flex min-w-10 justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-white/35"
                            }
                          >
                            {matchCount}
                          </span>
                        </td>

                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex items-center justify-end gap-2">
                            {track.spotifyUrl ? (
                              <a
                                href={track.spotifyUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/60 transition hover:border-emerald-400/25 hover:text-emerald-300"
                              >
                                Spotify ↗
                              </a>
                            ) : null}

                            <Link
                              href={`/tracks/${track.id}`}
                              className="inline-flex items-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-300 transition hover:bg-emerald-400/20"
                            >
                              Open workspace →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-white/[0.07] md:hidden">
              {tracks.map((track) => {
                const matchCount = track.matchCount ?? 0;

                return (
                  <article key={track.id} className="p-5">
                    <div className="flex gap-3.5">
                      <TrackArtwork track={track} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/tracks/${track.id}`}
                              className="block truncate text-base font-black text-white"
                            >
                              {track.title}
                            </Link>

                            <p className="mt-1 truncate text-sm text-white/45">
                              {(track.artists ?? []).join(", ") ||
                                "Unknown artist"}
                            </p>
                          </div>

                          <span
                            className={
                              matchCount > 0
                                ? "shrink-0 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-black text-emerald-300"
                                : "shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-bold text-white/35"
                            }
                          >
                            {matchCount} matches
                          </span>
                        </div>

                        <p className="mt-2 truncate text-xs text-white/30">
                          {track.albumName || "Unknown album"}
                        </p>
                      </div>
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5">
                        <dt className="text-[10px] font-black uppercase tracking-wider text-white/30">
                          Release
                        </dt>
                        <dd className="mt-1 text-xs font-bold text-white/65">
                          {formatReleaseDate(track.releaseDate)}
                        </dd>
                      </div>

                      <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5">
                        <dt className="text-[10px] font-black uppercase tracking-wider text-white/30">
                          Duration
                        </dt>
                        <dd className="mt-1 font-mono text-xs font-bold text-white/65">
                          {msToMinSec(track.durationMs)}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex gap-2">
                      {track.spotifyUrl ? (
                        <a
                          href={track.spotifyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-center text-sm font-bold text-white/60"
                        >
                          Spotify ↗
                        </a>
                      ) : null}

                      <Link
                        href={`/tracks/${track.id}`}
                        className="flex-1 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2.5 text-center text-sm font-black text-emerald-300"
                      >
                        Open workspace →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      )}

      
      </div>
    </main>
  );
}

function TrackArtwork({ track }: { track: Track }) {
  if (track.albumImageUrl) {
    return (
      <img
        src={track.albumImageUrl}
        alt={`Artwork for ${track.title}`}
        className="h-14 w-14 shrink-0 rounded-xl object-cover shadow-sm"
      />
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xl text-white/30">
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
    <div className="rounded-2xl border border-white/10 bg-[#0d0d0f] p-5">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-white/35">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-white">
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}
