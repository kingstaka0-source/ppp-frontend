"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://playlist-pitch-platform.onrender.com";

type SpotifyArtist = {
  id: string;
  name: string;
  email?: string | null;
  spotifyId?: string;
  imageUrl?: string;
  followers?: number;
  spotifyUrl?: string;
};

type SpotifyStatus = {
  connected: boolean;
  artist?: SpotifyArtist;
  error?: string;
  message?: string;
};

export default function SpotifyOnboardingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [artistId, setArtistId] = useState("");
  const [status, setStatus] = useState<SpotifyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const returnedArtistId = searchParams.get("artistId");
  const spotifyResult = searchParams.get("spotify");

  useEffect(() => {
    const storedArtistId = localStorage.getItem("tunereachArtistId");
    const resolvedArtistId = returnedArtistId || storedArtistId || "";

    if (returnedArtistId) {
      localStorage.setItem("tunereachArtistId", returnedArtistId);
    }

    setArtistId(resolvedArtistId);

    if (!resolvedArtistId) {
      setError("Your TuneReach artist profile could not be found.");
      setLoading(false);
      return;
    }

    void loadSpotifyStatus(resolvedArtistId);
  }, [returnedArtistId]);

  async function loadSpotifyStatus(id: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/auth/spotify/status?artistId=${encodeURIComponent(id)}`,
        {
          cache: "no-store",
        }
      );

      const data = (await response.json()) as SpotifyStatus;

      if (!response.ok) {
        throw new Error(data.message || data.error || "Unable to check Spotify");
      }

      setStatus(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to check your Spotify connection."
      );
    } finally {
      setLoading(false);
    }
  }

  function connectSpotify() {
    if (!artistId) {
      setError("Your artist profile is missing. Please restart onboarding.");
      return;
    }

    setConnecting(true);

    window.location.href =
      `${API_URL}/auth/spotify?artistId=${encodeURIComponent(artistId)}`;
  }

  function continueToImport() {
    router.push("/onboarding/import-track");
  }

  const connected = status?.connected === true;

  const initials = useMemo(() => {
    const name = status?.artist?.name || "Artist";

    return name
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [status?.artist?.name]);

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <div className="text-xl font-black tracking-tight">
            Tune<span className="text-emerald-400">Reach</span>
          </div>

          <div className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/65">
            Step 2 of 3
          </div>
        </header>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 rounded-full bg-emerald-400" />
        </div>

        <section className="mt-10 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-950 to-emerald-950 shadow-2xl">
          {loading ? (
            <LoadingState />
          ) : connected ? (
            <ConnectedState
              artist={status?.artist}
              initials={initials}
              onContinue={continueToImport}
            />
          ) : (
            <ConnectState
              connecting={connecting}
              error={error}
              spotifyResult={spotifyResult}
              onConnect={connectSpotify}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function ConnectState({
  connecting,
  error,
  spotifyResult,
  onConnect,
}: {
  connecting: boolean;
  error: string;
  spotifyResult: string | null;
  onConnect: () => void;
}) {
  return (
    <div className="grid min-h-[680px] lg:grid-cols-[1fr_0.85fr]">
      <div className="flex flex-col justify-center px-8 py-14 sm:px-14 lg:px-16">
        <SpotifyLogo />

        <p className="mt-8 text-sm font-black uppercase tracking-[0.24em] text-emerald-400">
          Connect your music
        </p>

        <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl">
          Bring your Spotify account into TuneReach.
        </h1>

        <p className="mt-7 max-w-2xl text-lg leading-8 text-white/60">
          TuneReach uses a secure Spotify connection to identify your account
          and prepare your music promotion workspace. We do not publish, edit
          or remove anything from your Spotify account.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <TrustBadge text="Secure OAuth connection" />
          <TrustBadge text="Read-only account access" />
          <TrustBadge text="Disconnect anytime" />
        </div>

        {spotifyResult === "error" && (
          <p className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">
            Spotify connection was cancelled or could not be completed.
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onConnect}
          disabled={connecting}
          className="mt-9 inline-flex w-fit items-center gap-3 rounded-2xl bg-[#1ed760] px-7 py-4 text-base font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SpotifyMarkSmall />
          {connecting ? "Opening Spotify..." : "Connect with Spotify"}
        </button>

        <p className="mt-4 text-sm text-white/35">
          You will be redirected to Spotify to approve the connection.
        </p>
      </div>

      <div className="relative border-t border-white/10 bg-white/[0.025] p-8 lg:border-l lg:border-t-0 sm:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,215,96,0.18),transparent_45%)]" />

        <div className="relative flex h-full items-center">
          <div className="w-full rounded-[28px] border border-white/10 bg-black/35 p-7 backdrop-blur">
            <p className="text-sm text-white/40">What you unlock</p>
            <h2 className="mt-2 text-3xl font-black">
              From release to campaign.
            </h2>

            <div className="mt-8 space-y-4">
              <Benefit text="Import your releases into TuneReach" />
              <Benefit text="Prepare playlist matching" />
              <Benefit text="Generate personalized curator pitches" />
              <Benefit text="Track campaign performance" />
              <Benefit text="Manage everything from one dashboard" />
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
              <p className="font-bold text-emerald-300">
                Your first campaign is close
              </p>
              <p className="mt-2 text-sm leading-6 text-white/50">
                Connect Spotify now. In the next step you will select the
                release you want to promote.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectedState({
  artist,
  initials,
  onContinue,
}: {
  artist?: SpotifyArtist;
  initials: string;
  onContinue: () => void;
}) {
  return (
    <div className="grid min-h-[680px] lg:grid-cols-[1fr_0.8fr]">
      <div className="flex flex-col justify-center px-8 py-14 sm:px-14 lg:px-16">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
          <span>✓</span>
          Spotify connected
        </div>

        <h1 className="mt-7 text-5xl font-black leading-tight sm:text-6xl">
          Your connection is ready.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
          TuneReach successfully connected your Spotify account. You can now
          continue to release selection.
        </p>

        <div className="mt-9 flex items-center gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          {artist?.imageUrl ? (
            <img
              src={artist.imageUrl}
              alt=""
              className="h-20 w-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-400 text-xl font-black text-black">
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm text-white/40">Connected Spotify account</p>
            <h2 className="mt-1 truncate text-2xl font-black">
              {artist?.name || "Spotify user"}
            </h2>
            {artist?.email && (
              <p className="mt-1 truncate text-sm text-white/45">
                {artist.email}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-9 w-fit rounded-2xl bg-emerald-400 px-8 py-4 font-black text-black transition hover:bg-emerald-300"
        >
          Continue to releases →
        </button>
      </div>

      <div className="border-t border-white/10 bg-white/[0.025] p-8 lg:border-l lg:border-t-0 sm:p-12">
        <div className="flex h-full items-center">
          <div className="w-full rounded-[28px] border border-white/10 bg-black/35 p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/40">Connection status</p>
                <h2 className="mt-2 text-3xl font-black">Verified</h2>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1ed760] text-2xl font-black text-black">
                ✓
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <StatusRow label="Spotify connection" value="Active" />
              <StatusRow
                label="Followers"
                value={String(artist?.followers ?? 0)}
              />
              <StatusRow label="Access mode" value="Read only" />
              <StatusRow label="Next step" value="Choose release" />
            </div>

            {artist?.spotifyUrl && (
              <a
                href={artist.spotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex text-sm font-bold text-emerald-300 hover:text-emerald-200"
              >
                Open Spotify profile ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[680px] flex-col items-center justify-center px-8 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-emerald-400" />
      <h1 className="mt-6 text-2xl font-black">Checking Spotify connection</h1>
      <p className="mt-3 text-white/45">This will only take a moment.</p>
    </div>
  );
}

function SpotifyLogo() {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#1ed760] shadow-[0_0_60px_rgba(30,215,96,0.2)]">
      <SpotifyMarkSmall large />
    </div>
  );
}

function SpotifyMarkSmall({ large = false }: { large?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={large ? "h-10 w-10 fill-black" : "h-6 w-6 fill-black"}
    >
      <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm4.58 14.42a.75.75 0 0 1-1.03.25 8.77 8.77 0 0 0-8.88-.55.75.75 0 1 1-.68-1.34 10.28 10.28 0 0 1 10.34.61.75.75 0 0 1 .25 1.03Zm1.47-2.83a.94.94 0 0 1-1.29.31 10.95 10.95 0 0 0-11.1-.69.94.94 0 1 1-.85-1.68 12.83 12.83 0 0 1 13 .77.94.94 0 0 1 .24 1.29Zm.13-2.95C14.58 8.5 8.6 8.3 5.17 9.35a1.13 1.13 0 1 1-.66-2.16c4-1.22 10.68-.98 14.83 1.48a1.13 1.13 0 0 1-1.16 1.97Z" />
    </svg>
  );
}

function TrustBadge({ text }: { text: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/60">
      ✓ {text}
    </div>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-sm text-emerald-300">
        ✓
      </span>
      <span className="text-white/70">{text}</span>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/8 pb-4 last:border-b-0">
      <span className="text-white/45">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}