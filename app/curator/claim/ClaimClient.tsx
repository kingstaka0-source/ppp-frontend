
"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

type Claim = {
  id: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
};

const TEST_PLAYLIST_ID = "cmw3crg5x0002xs6ps2lrznkz";

export default function ClaimClient() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const params = useSearchParams();

  const verification = params.get("spotifyVerification");
  const returnedClaimId = params.get("claimId");

  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function authenticatedPost(
    path: string,
    body?: Record<string, string>
  ) {
    const token = await getToken();

    if (!token) {
      throw new Error("Please sign in to TuneReach first.");
    }

    const response = await fetch(`${API}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || data.error || `Request failed (${response.status})`
      );
    }

    return data;
  }

  async function createClaim() {
    setLoading(true);
    setError(null);

    try {
      const result = await authenticatedPost("/curator-claims", {
        playlistId: TEST_PLAYLIST_ID,
      });

      setClaim(result.claim);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create claim."
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyWithSpotify() {
    const claimId = claim?.id || returnedClaimId;

    if (!claimId) {
      setError("Create a playlist claim first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authenticatedPost(
        `/curator-claims/${encodeURIComponent(claimId)}/spotify/start`
      );

      if (
        typeof result.url !== "string" ||
        !result.url.startsWith("https://accounts.spotify.com/authorize?")
      ) {
        throw new Error("Invalid Spotify authorization URL.");
      }

      window.location.assign(result.url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not start Spotify verification."
      );
      setLoading(false);
    }
  }

  const messages: Record<string, string> = {
    verified: "Spotify ownership verification completed successfully.",
    "owner-mismatch":
      "This Spotify account does not own the selected playlist.",
    cancelled: "Spotify verification was cancelled.",
    "owner-unavailable":
      "Spotify owner information is unavailable for this playlist.",
    "not-pending": "This claim is no longer pending verification.",
  };

  return (
    <main className="min-h-screen bg-[#090b0a] px-5 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1ed760]">
            TuneReach Curator
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Verify Playlist Ownership
          </h1>

          <p className="mt-4 text-zinc-400">
            Claim your Spotify playlist and verify ownership securely
            through your Spotify account.
          </p>
        </div>

        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-7">
          <div className="mb-6">
            <p className="text-sm text-zinc-500">Selected playlist</p>
            <h2 className="mt-2 text-2xl font-bold">OUR MUSIC</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Spotify owner: King Staka
            </p>
          </div>

          {verification && (
            <div
              role="status"
              className={`mb-6 rounded-2xl border p-4 ${
                verification === "verified"
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-amber-400/30 bg-amber-400/10 text-amber-200"
              }`}
            >
              {messages[verification] ||
                "Spotify verification returned an unknown result."}
            </div>
          )}

          {claim && (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-zinc-400">
                Claim status
              </p>
              <p className="mt-1 font-bold text-[#1ed760]">
                {claim.status}
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300"
            >
              {error}
            </div>
          )}

          {!isLoaded ? (
            <p className="text-zinc-400">Checking account...</p>
          ) : !isSignedIn ? (
            <p className="text-amber-300">
              Sign in to TuneReach before claiming a playlist.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={createClaim}
                disabled={loading || claim?.status === "VERIFIED"}
                className="rounded-2xl bg-[#1ed760] px-6 py-3 font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Processing..." : "Claim Playlist"}
              </button>

              {(claim?.status === "PENDING" ||
                (returnedClaimId && verification !== "verified")) && (
                <button
                  type="button"
                  onClick={verifyWithSpotify}
                  disabled={loading}
                  className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 font-bold text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  Verify with Spotify
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
