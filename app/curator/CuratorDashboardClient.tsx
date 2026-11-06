
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

type Playlist = {
  id: string;
  name: string;
  description: string | null;
  spotifyPlaylistId: string | null;
  spotifyUrl: string | null;
  ownerDisplayName: string | null;
  genres: string[];
  claimId: string;
  verifiedAt: string | null;
  verificationStatus: "VERIFIED";
};

type DashboardData = {
  curator: {
    id: string;
    name: string;
    email: string | null;
  };
  stats: {
    verifiedPlaylists: number;
  };
  playlists: Playlist[];
};

export default function CuratorDashboardClient() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      setNeedsVerification(false);

      try {
        const token = await getToken();

        if (!token) {
          throw new Error("Could not get authentication token.");
        }

        const response = await fetch(`${API}/curator/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (response.status === 404) {
          if (!cancelled) setNeedsVerification(true);
          return;
        }

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.message ||
              result.error ||
              `Request failed (${response.status})`
          );
        }

        if (!cancelled) {
          setData(result as DashboardData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load curator dashboard."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken]);

  return (
    <main className="min-h-screen bg-[#090b0a] px-5 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1ed760]">
            TuneReach Curator
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Curator Dashboard
          </h1>

          <p className="mt-3 text-zinc-400">
            Manage your verified Spotify playlists.
          </p>
        </header>

        {!isLoaded || loading ? (
          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8 text-zinc-400">
            Loading curator dashboard...
          </div>
        ) : !isSignedIn ? (
          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8">
            <h2 className="text-xl font-bold">Sign in required</h2>
            <p className="mt-2 text-zinc-400">
              Sign in to TuneReach to access your curator dashboard.
            </p>
          </div>
        ) : needsVerification ? (
          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8">
            <h2 className="text-xl font-bold">
              Verify your playlist ownership
            </h2>
            <p className="mt-2 text-zinc-400">
              Your account does not have a verified curator profile yet.
            </p>
            <a
              href="/curator/claim"
              className="mt-5 inline-block rounded-2xl bg-[#1ed760] px-5 py-3 font-bold text-black"
            >
              Verify Playlist
            </a>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-red-300"
          >
            {error}
          </div>
        ) : data ? (
          <>
            <section className="mb-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
                <p className="text-sm text-zinc-400">Curator</p>
                <p className="mt-3 text-2xl font-bold">
                  {data.curator.name}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
                <p className="text-sm text-zinc-400">
                  Verified Playlists
                </p>
                <p className="mt-3 text-4xl font-black text-[#1ed760]">
                  {data.stats.verifiedPlaylists}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
                <p className="text-sm text-zinc-400">
                  Verification
                </p>
                <p className="mt-3 text-xl font-bold text-[#1ed760]">
                  Spotify Verified
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">My Playlists</h2>
                <span className="text-sm text-zinc-400">
                  {data.playlists.length} verified
                </span>
              </div>

              {data.playlists.length === 0 ? (
                <p className="text-zinc-400">
                  No verified playlists found.
                </p>
              ) : (
                <div className="space-y-4">
                  {data.playlists.map((playlist) => (
                    <article
                      key={playlist.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold">
                            {playlist.name}
                          </h3>
                          <p className="mt-1 text-sm text-zinc-400">
                            Owner:{" "}
                            {playlist.ownerDisplayName || "Unknown"}
                          </p>
                        </div>

                        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                          VERIFIED
                        </span>
                      </div>

                      {playlist.description && (
                        <p className="mt-4 text-sm text-zinc-400">
                          {playlist.description}
                        </p>
                      )}

                      {playlist.genres.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {playlist.genres.map((genre) => (
                            <span
                              key={genre}
                              className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}

                      {playlist.spotifyUrl && (
                        <a
                          href={playlist.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-block text-sm font-bold text-[#1ed760] hover:underline"
                        >
                          Open on Spotify
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <p className="text-zinc-400">
            No dashboard data available.
          </p>
        )}
      </div>
    </main>
  );
}
