"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

type SpotifyImage = {
  url?: string;
  width?: number | null;
  height?: number | null;
};

type SpotifyArtist = {
  id?: string;
  name?: string;
};

type SpotifyRelease = {
  id: string;
  name: string;
  album_type?: string;
  album_group?: string;
  release_date?: string;
  total_tracks?: number;
  images?: SpotifyImage[];
  artists?: SpotifyArtist[];
  external_urls?: {
    spotify?: string;
  };
};

type ReleasesResponse = {
  success?: boolean;
  total?: number;
  releases?: SpotifyRelease[];
  error?: string;
  message?: string;
};

type ImportResponse = {
  success?: boolean;
  imported?: number;
  created?: number;
  updated?: number;
  skipped?: number;
  total?: number;
  error?: string;
  message?: string;
};

export default function ImportTrackOnboardingPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [releases, setReleases] = useState<SpotifyRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [importMessage, setImportMessage] = useState("");

  const getAuthHeaders = useCallback(async () => {
    const token = await getToken();

    if (!token) {
      throw new Error("Could not get authentication token.");
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [getToken]);

  const loadReleases = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_URL}/auth/spotify/releases`, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      const data = (await response.json()) as ReleasesResponse;

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Could not load your Spotify releases.",
        );
      }

      setReleases(Array.isArray(data.releases) ? data.releases : []);
    } catch (err) {
      setReleases([]);

      setError(
        err instanceof Error
          ? err.message
          : "Could not load your Spotify releases.",
      );
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setError("You must be signed in to import Spotify releases.");
      setLoading(false);
      return;
    }

    void loadReleases();
  }, [isLoaded, isSignedIn, loadReleases]);

  async function importSpotifyCatalog() {
    if (importing) {
      return;
    }

    setImporting(true);
    setError("");
    setImportMessage("");

    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_URL}/auth/spotify/import-all-tracks`,
        {
          method: "POST",
          headers,
          cache: "no-store",
        },
      );

      const data = (await response.json()) as ImportResponse;

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Could not import your Spotify tracks.",
        );
      }

      const importedCount =
        data.imported ??
        data.created ??
        data.total ??
        0;

      setImportMessage(
        importedCount > 0
          ? `${importedCount} Spotify track(s) imported successfully.`
          : "Your Spotify catalog was processed successfully.",
      );

      window.setTimeout(() => {
        router.replace("/dashboard");
      }, 900);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not import your Spotify tracks.",
      );

      setImporting(false);
    }
  }

  function goToDashboard() {
    router.replace("/dashboard");
  }

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white sm:px-8">
      <section className="mx-auto w-full max-w-6xl rounded-[32px] border border-white/10 bg-zinc-950 p-7 shadow-2xl sm:p-12">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-400">
              Step 3 of 3
            </p>

            <h1 className="mt-4 text-4xl font-black sm:text-5xl">
              Import your Spotify music
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/55">
              Review your Spotify releases and import your catalog into
              TuneReach. Your tracks can then be matched with relevant
              playlists.
            </p>
          </div>

          {!loading && releases.length > 0 && (
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
              {releases.length} release
              {releases.length === 1 ? "" : "s"} found
            </div>
          )}
        </div>

        {loading && (
          <div className="mt-10 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.025]">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-emerald-400" />

            <p className="mt-5 font-bold">
              Loading your Spotify releases…
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-500/25 bg-red-500/10 p-5 text-red-300">
            <p className="font-bold">Spotify import could not continue</p>
            <p className="mt-2 text-sm">{error}</p>

            <button
              type="button"
              onClick={() => void loadReleases()}
              className="mt-5 cursor-pointer rounded-xl border border-red-300/20 bg-white/5 px-5 py-3 font-bold text-white transition hover:bg-white/10"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && releases.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-white/15 bg-white/[0.025] p-10 text-center">
            <div className="text-5xl">📀</div>

            <h2 className="mt-5 text-xl font-bold">
              No Spotify releases found
            </h2>

            <p className="mt-3 text-white/45">
              TuneReach could not find releases for the connected Spotify
              artist profile.
            </p>
          </div>
        )}

        {!loading && releases.length > 0 && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {releases.map((release) => {
              const imageUrl = release.images?.[0]?.url;
              const artistNames =
                release.artists
                  ?.map((artist) => artist.name)
                  .filter(Boolean)
                  .join(", ") || "Spotify artist";

              return (
                <article
                  key={release.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] transition hover:border-emerald-400/30 hover:bg-white/[0.055]"
                >
                  <div className="aspect-square bg-white/5">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`${release.name} cover`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-6xl">
                        📀
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
                      {release.album_type || "Release"}
                    </p>

                    <h2 className="mt-2 line-clamp-2 text-xl font-black">
                      {release.name}
                    </h2>

                    <p className="mt-2 truncate text-sm text-white/45">
                      {artistNames}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-sm text-white/40">
                      <span>{release.release_date || "Date unknown"}</span>
                      <span>
                        {release.total_tracks ?? 0} track
                        {(release.total_tracks ?? 0) === 1 ? "" : "s"}
                      </span>
                    </div>

                    {release.external_urls?.spotify && (
                      <a
                        href={release.external_urls.spotify}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex font-bold text-emerald-300 transition hover:text-emerald-200"
                      >
                        Open on Spotify ↗
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {importMessage && (
          <div className="mt-8 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-5 text-emerald-300">
            {importMessage}
          </div>
        )}

        <div className="mt-9 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={importSpotifyCatalog}
            disabled={
              loading ||
              importing ||
              releases.length === 0
            }
            className="cursor-pointer rounded-2xl bg-emerald-400 px-8 py-4 font-black text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {importing
              ? "Importing Spotify tracks…"
              : "Import Spotify tracks →"}
          </button>

          <button
            type="button"
            onClick={goToDashboard}
            disabled={importing}
            className="cursor-pointer rounded-2xl border border-white/15 bg-white/5 px-8 py-4 font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Go to Dashboard
          </button>
        </div>
      </section>
    </main>
  );
}