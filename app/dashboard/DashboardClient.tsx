"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SignInButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import LegalGate from "@/app/components/LegalGate";
import IntakeTrackCard from "@/app/components/IntakeTrackCard";



const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const DEFAULT_ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

type Usage = {
  artistId: string;
  plan: "FREE" | "TRIAL" | "PRO";
  trial: null | { until: string };
  month: {
    sentThisMonth: number;
    createdThisMonth?: number;
    limit: number | null;
    remaining: number | null;
  };
};

type BillingAccess = {
  plan: "FREE" | "TRIAL" | "PRO";
  isPaid: boolean;
  trialUntil: string | null;
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  limits: {
    pitchesPerMonth: number | null;
    createdThisMonth: number;
    remaining: number | null;
  };
  features: {
    canCreatePitch: boolean;
    canLaunchCampaign: boolean;
    canAutoSend: boolean;
    canBulkQueue: boolean;
    canUseUnlimitedPitches: boolean;
  };
};

type BillingAccessResponse = {
  ok?: boolean;
  access?: BillingAccess;
  error?: string;
  message?: string;
};

type LegalBlock = {
  accepted: Record<string, { version: string; acceptedAt: string }>;
  required: Record<string, string>;
  missing?: string[];
  allAccepted?: boolean;
};

type OverviewTrack = {
  id: string;
  spotifyTrackId: string;
  spotifyUrl: string | null;
  albumName: string | null;
  albumImageUrl: string | null;
  title: string;
  artists: string[];
  durationMs: number;
  createdAt: string;
  matchCount: number;
};

type Overview = {
  ok: boolean;
  artist: {
    id: string;
    name: string;
    email: string | null;
    plan: "FREE" | "TRIAL" | "PRO";
    trialUntil: string | null;
    createdAt: string;
    spotifyArtistName: string | null;
    spotifyArtistUrl: string | null;
    spotifyArtistImageUrl: string | null;
    dashboardCoverZoom: number;
    dashboardCoverPositionX: number;
    dashboardCoverPositionY: number;
  };
  legal: LegalBlock;
  tracks: OverviewTrack[];
  analytics?: {
  totalCampaigns?: number;
  totalSentPitches?: number;
  totalPlacements?: number;
  placementRate?: number;
  replyRate?: number;
  openRate?: number;
  clickRate?: number;

  totalOpens?: number;
  totalClicks?: number;
  totalReplies?: number;

  interestedCurators?: number;
  negativeReplies?: number;

  draftCount?: number;
  queuedCount?: number;
  sentCount?: number;
  deliveredCount?: number;

  topPerformingTrack?: {
    title: string;
    placementCount: number;
    sentCount: number;
  };

  mostPitchedTrack?: {
    title: string;
    pitchCount: number;
  };

  bestPlaylistCategory?: {
    category: string;
    pitchCount: number;
  };

  topCuratorSources?: {
    source: string;
    sentCount: number;
  }[];

  conversionFunnel?: {
    drafts: number;
    queued: number;
    sent: number;
    placements: number;
    draftToQueuedRate: number;
    queuedToSentRate: number;
    sentToPlacementRate: number;
  };
};
};

function daysLeft(untilIso?: string | null) {
  if (!untilIso) return null;
  const until = new Date(untilIso).getTime();
  const now = Date.now();
  const ms = until - now;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function PlanBadge({ plan }: { plan: "FREE" | "TRIAL" | "PRO" }) {
  const styles =
    plan === "PRO"
      ? "bg-green-100 text-green-800 border-green-300"
      : plan === "TRIAL"
      ? "bg-blue-100 text-blue-800 border-blue-300"
      : "bg-amber-100 text-amber-800 border-amber-300";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${styles}`}
    >
      {plan}
    </span>
  );
}

function linkWithArtistId(path: string, artistId: string) {
  if (!artistId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}artistId=${encodeURIComponent(artistId)}`;
}

export default function DashboardClient() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  const [artistId, setArtistId] = useState<string>("");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [legal, setLegal] = useState<LegalBlock | null>(null);
  const [access, setAccess] = useState<BillingAccess | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [isEditingCover, setIsEditingCover] = useState(false);
  const [coverZoom, setCoverZoom] = useState(100);
  const [coverPositionX, setCoverPositionX] = useState(50);
  const [coverPositionY, setCoverPositionY] = useState(50);
  const [savingCover, setSavingCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  async function loadAll() {
  setLoading(true);
  setErr(null);

  try {
    if (!isSignedIn) {
      throw new Error("You must be signed in.");
    }

    const token = await getToken();

    if (!token) {
      throw new Error("Could not get authentication token.");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const [uRes, oRes, aRes] = await Promise.all([
      fetch(`${API}/artists/me/usage`, {
        cache: "no-store",
        headers,
      }),
      fetch(`${API}/dashboard/overview`, {
        cache: "no-store",
        headers,
      }),
      fetch(`${API}/billing/access`, {
        cache: "no-store",
        headers,
      }),
    ]);

    const uText = await uRes.text();
    const oText = await oRes.text();
    const aText = await aRes.text();

    if (!uRes.ok) throw new Error(uText || `Usage HTTP ${uRes.status}`);
    if (!oRes.ok) throw new Error(oText || `Overview HTTP ${oRes.status}`);
    if (!aRes.ok) throw new Error(aText || `Access HTTP ${aRes.status}`);

    const u = JSON.parse(uText) as Usage;
    const o = JSON.parse(oText) as Overview;
    const a = JSON.parse(aText) as BillingAccessResponse;

    setArtistId(o.artist.id);
    setUsage(u);
    setOverview(o);
    setCoverZoom(o.artist.dashboardCoverZoom ?? 100);
    setCoverPositionX(o.artist.dashboardCoverPositionX ?? 50);
    setCoverPositionY(o.artist.dashboardCoverPositionY ?? 50);
    setLegal((o?.legal ?? null) as LegalBlock | null);
    setAccess(a?.access ?? null);
  } catch (e: any) {
    setErr(e?.message ?? "Failed to load dashboard");
  } finally {
    setLoading(false);
  }
}

  async function saveCover() {
    setSavingCover(true);
    setCoverError(null);

    try {
      if (!isSignedIn) {
        throw new Error("You must be signed in.");
      }

      const token = await getToken();

      if (!token) {
        throw new Error("Could not get authentication token.");
      }

      const response = await fetch(`${API}/dashboard/cover`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zoom: coverZoom,
          positionX: coverPositionX,
          positionY: coverPositionY,
        }),
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || `Cover update HTTP ${response.status}`);
      }

      const result = JSON.parse(text) as {
        ok: boolean;
        cover: {
          zoom: number;
          positionX: number;
          positionY: number;
        };
      };

      setCoverZoom(result.cover.zoom);
      setCoverPositionX(result.cover.positionX);
      setCoverPositionY(result.cover.positionY);

      setOverview((current) =>
        current
          ? {
              ...current,
              artist: {
                ...current.artist,
                dashboardCoverZoom: result.cover.zoom,
                dashboardCoverPositionX: result.cover.positionX,
                dashboardCoverPositionY: result.cover.positionY,
              },
            }
          : current
      );

      setIsEditingCover(false);
    } catch (e: any) {
      setCoverError(e?.message ?? "Failed to save cover settings.");
    } finally {
      setSavingCover(false);
    }
  }
  useEffect(() => {
  if (!isLoaded) return;

  if (!isSignedIn) {
    setLoading(false);
    return;
  }

  loadAll();
}, [isLoaded, isSignedIn]);

  const trialDaysLeft = useMemo(
    () => daysLeft(usage?.trial?.until ?? access?.trialUntil ?? null),
    [usage?.trial?.until, access?.trialUntil]
  );

  const showTrialBanner = usage?.plan === "TRIAL" && trialDaysLeft !== null;
  const showTrialWarning =
    usage?.plan === "TRIAL" && (trialDaysLeft ?? 999) <= 2;
  const showFreeLimitBanner =
    usage?.plan === "FREE" && (usage?.month?.remaining ?? 999) <= 1;

  const totalTracks = overview?.tracks?.length ?? 0;
  const totalMatches = (overview?.tracks ?? []).reduce(
    (sum, t) => sum + (t.matchCount ?? 0),
    0
  );

  const analytics = overview?.analytics;

const artistName =
  overview?.artist?.spotifyArtistName?.trim() ||
  overview?.artist?.name?.trim() ||
  "Artist";

const artistImageUrl =
  overview?.artist?.spotifyArtistImageUrl?.trim() || null;

const spotifyArtistUrl =
  overview?.artist?.spotifyArtistUrl?.trim() || null;
const hasTracks = totalTracks > 0;

const totalCampaigns = analytics?.totalCampaigns ?? 0;
const totalSentPitches = analytics?.totalSentPitches ?? 0;
const totalPlacements = analytics?.totalPlacements ?? 0;
const placementRate = analytics?.placementRate ?? 0;

  return (
    <div className="mx-auto max-w-7xl space-y-7 px-5 py-8 md:px-8 md:py-10">
      {!loading && !err && artistId && (
        <LegalGate
          subjectType="ARTIST"
          subjectId={artistId}
          legal={legal}
          onAccepted={() => loadAll()}
        />
      )}

      <section className="relative overflow-hidden rounded-3xl bg-zinc-950 p-8 text-white shadow-2xl">
        {artistImageUrl && (
          <>
            <div
              className="pointer-events-none absolute inset-0 scale-110 bg-cover bg-center opacity-45 blur-2xl"
              style={{
                backgroundImage: `url("${artistImageUrl}")`,
              }}
            />

            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `url("${artistImageUrl}")`,
                backgroundRepeat: "no-repeat",
                backgroundSize: `${coverZoom}% auto`,
                backgroundPosition: `${coverPositionX}% ${coverPositionY}%`,
              }}
            />
          </>
        )}

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.82)_42%,rgba(0,0,0,0.50)_72%,rgba(0,0,0,0.72)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.32),transparent_38%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

<div className="relative z-20 mb-4 flex flex-wrap items-center gap-2">
  <Link href="/dashboard" className="mr-3 shrink-0" aria-label="TuneReach dashboard">
    <img
      src="/brand/logo.svg"
      alt="TuneReach"
      className="h-9 w-auto"
    />
  </Link>
  {usage?.plan && <PlanBadge plan={usage.plan} />}

  {access?.subscriptionStatus && (
    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm">
      {access.subscriptionStatus}
    </span>
  )}

  <div className="ml-auto">
    {!isLoaded ? (
      <div className="h-10 w-24 animate-pulse rounded-full bg-white/20" />
    ) : isSignedIn ? (
      <div className="flex items-center gap-3 rounded-full border border-white/20 bg-black/30 p-1 pr-4 backdrop-blur">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-10 w-10",
            },
          }}
        />

        <span className="hidden text-sm font-medium text-white sm:block">
          {user?.firstName || user?.username || "Account"}
        </span>
      </div>
    ) : (
  <SignInButton mode="modal">
    <button
      type="button"
      className="relative z-20 cursor-pointer rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white hover:text-black"
    >
      Sign in
    </button>
  </SignInButton>
)}
  </div>
</div>

  <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-green-500/10 blur-3xl" />
<div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />

{artistImageUrl && (
  <div className="relative z-30 mb-6 flex justify-end">
    {!isEditingCover ? (
      <button
        type="button"
        onClick={() => {
          setCoverError(null);
          setIsEditingCover(true);
        }}
        className="rounded-full border border-white/20 bg-black/40 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:border-green-400/50 hover:bg-black/60"
      >
        Edit cover
      </button>
    ) : (
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-black/75 p-5 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-black text-white">
              Adjust cover
            </div>
            <div className="mt-1 text-xs text-zinc-400">
              Changes are previewed live.
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setCoverZoom(overview?.artist.dashboardCoverZoom ?? 100);
              setCoverPositionX(
                overview?.artist.dashboardCoverPositionX ?? 50
              );
              setCoverPositionY(
                overview?.artist.dashboardCoverPositionY ?? 50
              );
              setCoverError(null);
              setIsEditingCover(false);
            }}
            disabled={savingCover}
            className="text-sm font-semibold text-zinc-400 transition hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        <label className="block">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-zinc-300">
            <span>Zoom</span>
            <span>{coverZoom}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="200"
            step="1"
            value={coverZoom}
            onChange={(event) =>
              setCoverZoom(Number(event.target.value))
            }
            className="w-full accent-green-500"
          />
        </label>

        <label className="mt-4 block">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-zinc-300">
            <span>Horizontal</span>
            <span>{coverPositionX}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={coverPositionX}
            onChange={(event) =>
              setCoverPositionX(Number(event.target.value))
            }
            className="w-full accent-green-500"
          />
        </label>

        <label className="mt-4 block">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-zinc-300">
            <span>Vertical</span>
            <span>{coverPositionY}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={coverPositionY}
            onChange={(event) =>
              setCoverPositionY(Number(event.target.value))
            }
            className="w-full accent-green-500"
          />
        </label>

        {coverError && (
          <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {coverError}
          </div>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setCoverZoom(100);
              setCoverPositionX(50);
              setCoverPositionY(50);
              setCoverError(null);
            }}
            disabled={savingCover}
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={saveCover}
            disabled={savingCover}
            className="rounded-full bg-green-500 px-5 py-2 text-sm font-black text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingCover ? "Saving..." : "Save cover"}
          </button>
        </div>
      </div>
    )}
  </div>
)}

  <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

    <div className="max-w-2xl">

      
      <div className="text-xs font-black uppercase tracking-[0.28em] text-green-400">
        Welcome back
      </div>

      <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
        {artistName}
      </h1>

      <p className="mt-4 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
        Your music promotion command center for playlist matching,
        curator connections and campaign performance.
      </p>

      {spotifyArtistUrl && (
        <a
          href={spotifyArtistUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center rounded-full border border-green-400/30 bg-green-400/10 px-4 py-2 text-sm font-bold text-green-300 backdrop-blur transition hover:bg-green-400 hover:text-black"
        >
          View on Spotify ↗
        </a>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={linkWithArtistId("/pricing", artistId)}
          className="rounded-xl border border-white/20 px-5 py-3 hover:bg-white hover:text-black transition"
        >
          Pricing
        </Link>

        {usage?.plan !== "PRO" && (
        <Link
          href={linkWithArtistId("/upgrade", artistId)}
          className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-black hover:bg-green-400 transition"
        >
          Upgrade →
        </Link>
      )}
      </div>

    </div>

    <div className="grid grid-cols-2 gap-4">

      <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
        <div className="text-sm text-zinc-300">Tracks</div>
        <div className="mt-2 text-4xl font-bold">{totalTracks}</div>
      </div>

      <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
        <div className="text-sm text-zinc-300">Matches</div>
        <div className="mt-2 text-4xl font-bold">{totalMatches}</div>
      </div>

      <Link
  href="/campaigns"
  className="rounded-2xl bg-white/10 p-5 backdrop-blur transition hover:bg-white/15 hover:-translate-y-0.5"
>
  <div className="text-sm text-zinc-300">Campaigns</div>

  <div className="mt-2 text-4xl font-bold">
    {totalCampaigns}
  </div>

  <div className="mt-2 text-xs font-semibold text-emerald-300">
    View history →
  </div>
</Link>

      <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
        <div className="text-sm text-zinc-300">Placements</div>
        <div className="mt-2 text-4xl font-bold">{totalPlacements}</div>
      </div>

    </div>

  </div>

</section>

              
      <nav
        aria-label="TuneReach workspace"
        className="rounded-2xl border border-white/10 bg-zinc-950 p-2 shadow-xl"
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <Link
            href={linkWithArtistId("/tracks", artistId)}
            className="group rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.08]"
          >
            <div className="text-sm font-black text-white">Tracks</div>
            <div className="mt-1 text-xs text-white/40 group-hover:text-emerald-300">
              Manage your music
            </div>
          </Link>

          <Link
            href={linkWithArtistId("/pitches", artistId)}
            className="group rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.08]"
          >
            <div className="text-sm font-black text-white">Pitches</div>
            <div className="mt-1 text-xs text-white/40 group-hover:text-emerald-300">
              Review campaign pitches
            </div>
          </Link>

          <Link
            href="/curators"
            className="group rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.08]"
          >
            <div className="text-sm font-black text-white">Curators</div>
            <div className="mt-1 text-xs text-white/40 group-hover:text-emerald-300">
              Explore curator network
            </div>
          </Link>

          <Link
            href="/followups"
            className="group rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.08]"
          >
            <div className="text-sm font-black text-white">Follow-ups</div>
            <div className="mt-1 text-xs text-white/40 group-hover:text-emerald-300">
              Manage conversations
            </div>
          </Link>

          <Link
            href="/campaigns"
            className="group rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.08]"
          >
            <div className="text-sm font-black text-white">Campaigns</div>
            <div className="mt-1 text-xs text-white/40 group-hover:text-emerald-300">
              Review campaign history
            </div>
          </Link>
        </div>
      </nav>

      {!loading && !err && overview && (
        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl md:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                Music Library
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
                Recent Tracks
              </h2>
              <p className="mt-1 text-sm text-white/45">
                Your latest imported tracks and their current playlist matches.
              </p>
            </div>

            <Link
              href={linkWithArtistId("/tracks", artistId)}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-bold text-white transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.08] hover:text-emerald-300"
            >
              All tracks
            </Link>
          </div>

          {(overview.tracks ?? []).length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.025] p-6 text-sm text-white/45">
              No tracks yet. Add one using{" "}
              <span className="font-semibold text-white">Track Intake</span> above.
            </div>
          ) : (
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {(overview.tracks ?? []).slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 transition hover:border-emerald-400/25 hover:bg-white/[0.06]"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                    {t.albumImageUrl ? (
                      <img
                        src={t.albumImageUrl}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-black text-emerald-400/60">
                        ♪
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-black text-white">
                      {t.title}
                    </div>
                    <div className="mt-1 truncate text-sm text-white/55">
                      {(t.artists ?? []).join(", ")}
                    </div>
                    {t.albumName && (
                      <div className="mt-0.5 truncate text-xs text-white/35">
                        {t.albumName}
                      </div>
                    )}
                    <div className="mt-2 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/[0.1] px-2.5 py-1 text-xs font-bold text-emerald-300">
                      {t.matchCount} matches
                    </div>
                  </div>

                  <Link
                    href={linkWithArtistId(`/tracks/${t.id}`, artistId)}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-400 px-3 py-2 text-xs font-black text-zinc-950 transition hover:bg-emerald-300"
                  >
                    Open track
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {!loading && !err && overview && (
        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl md:p-7">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              Performance
            </p>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Campaign Analytics
            </h2>
            <p className="text-sm text-white/45">
              Track your pitching activity and placement performance.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {[
              ["Campaigns", overview.analytics?.totalCampaigns ?? 0],
              ["Sent", overview.analytics?.sentCount ?? 0],
              ["Placements", overview.analytics?.totalPlacements ?? 0],
              ["Open Rate", `${overview.analytics?.openRate ?? 0}%`],
              ["Click Rate", `${overview.analytics?.clickRate ?? 0}%`],
              ["Reply Rate", `${overview.analytics?.replyRate ?? 0}%`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 transition hover:border-emerald-400/20 hover:bg-white/[0.055]"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                  {label}
                </p>
                <p className="mt-1.5 text-2xl font-black tracking-tight text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 sm:grid-cols-4 lg:grid-cols-7">
            {[
              ["Delivered", overview.analytics?.deliveredCount ?? 0],
              ["Drafts", overview.analytics?.draftCount ?? 0],
              ["Queued", overview.analytics?.queuedCount ?? 0],
              ["Placement Rate", `${overview.analytics?.placementRate ?? 0}%`],
              ["Interested", overview.analytics?.interestedCurators ?? 0],
              ["Total Opens", overview.analytics?.totalOpens ?? 0],
              ["Total Clicks", overview.analytics?.totalClicks ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                  {label}
                </p>
                <p className="mt-1 text-lg font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {!loading && !err && overview?.analytics && (
        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl md:p-7">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              Insights
            </p>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Advanced Analytics
            </h2>
            <p className="text-sm text-white/45">
              See which tracks, playlists and campaign stages are performing best.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Top Performing Track", overview.analytics.topPerformingTrack?.title ?? "-"],
              ["Most Pitched Track", overview.analytics.mostPitchedTrack?.title ?? "-"],
              ["Best Playlist Category", overview.analytics.bestPlaylistCategory?.category ?? "-"],
              ["Top Curator Source", overview.analytics.topCuratorSources?.[0]?.source ?? "-"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
                  {label}
                </p>
                <p className="mt-1.5 truncate text-lg font-black text-white" title={String(value)}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-400">
                  Campaign Flow
                </p>
                <h3 className="mt-1 text-lg font-black text-white">Conversion Funnel</h3>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4 lg:ml-6">
                {[
                  ["Drafts", overview.analytics.conversionFunnel?.drafts ?? 0],
                  ["Queued", overview.analytics.conversionFunnel?.queued ?? 0],
                  ["Sent", overview.analytics.conversionFunnel?.sent ?? 0],
                  ["Placements", overview.analytics.conversionFunnel?.placements ?? 0],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-white/35">{label}</p>
                    <p className="mt-1 text-xl font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-3 text-xs text-white/45">
              <span>
                Draft → Queue{" "}<strong className="text-white">{overview.analytics.conversionFunnel?.draftToQueuedRate ?? 0}%</strong>
              </span>
              <span>
                Queue → Sent{" "}<strong className="text-white">{overview.analytics.conversionFunnel?.queuedToSentRate ?? 0}%</strong>
              </span>
              <span>
                Sent → Placement{" "}<strong className="text-white">{overview.analytics.conversionFunnel?.sentToPlacementRate ?? 0}%</strong>
              </span>
            </div>
          </div>
        </section>
      )}

      {loading && <p>Loading…</p>}
      {err && <p className="text-red-600 whitespace-pre-wrap">Error: {err}</p>}

      {!loading && !err && (
  <IntakeTrackCard
    artistId={artistId}
    onDone={loadAll}
  />
)}

      {!loading && !err && usage && access && (
        <div className="space-y-3">
          {showTrialBanner && (
            <div
              className={`border rounded-xl p-4 ${
                showTrialWarning ? "bg-yellow-50" : "bg-blue-50"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">
                    TRIAL active — {trialDaysLeft} day
                    {trialDaysLeft === 1 ? "" : "s"} remaining.
                  </div>
                  <div className="text-sm text-gray-700">
                    {showTrialWarning
                      ? "Your trial is ending soon. Manage your billing to keep unlimited access."
                      : "You have unlimited pitches and campaign launch access during your trial."}
                  </div>
                </div>

                <Link
                  href={linkWithArtistId("/upgrade", artistId)}
                  className="px-4 py-2 rounded bg-black text-white hover:opacity-90 transition"
                >
                  Manage trial →
                </Link>
              </div>
            </div>
          )}

          {showFreeLimitBanner && (
            <div className="border rounded-xl p-4 bg-yellow-50">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">Your FREE limit is almost reached.</div>
                  <div className="text-sm text-gray-700">
                    Remaining this month: <b>{usage.month.remaining}</b> /{" "}
                    <b>{usage.month.limit}</b>
                  </div>
                </div>

                <Link
                  href={linkWithArtistId("/upgrade", artistId)}
                  className="px-4 py-2 rounded bg-black text-white hover:opacity-90 transition"
                >
                  Upgrade →
                </Link>
              </div>
            </div>
          )}

          {usage.plan === "FREE" && (
            <div className="border rounded-xl p-4 bg-amber-50 border-amber-300">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">
                    Campaign launch is locked on FREE
                  </div>
                  <div className="text-sm text-gray-700">
                    Upgrade to TRIAL or PRO to unlock campaign launch, bulk
                    actions, auto send, and unlimited pitches.
                  </div>
                </div>

                <Link
                  href={linkWithArtistId("/upgrade", artistId)}
                  className="px-4 py-2 rounded border border-black hover:bg-black hover:text-white transition"
                >
                  Unlock PRO →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !err && usage && overview && access && (
        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 lg:max-w-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                Account Overview
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
                Your TuneReach Plan
              </h2>
              <p className="mt-1 text-sm text-white/45">
                Your current access, imported music and playlist matching activity.
              </p>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3 lg:max-w-3xl">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                  Plan
                </p>

                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-2xl font-black text-white">{usage.plan}</span>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                    Active
                  </span>
                </div>

                {usage.plan === "FREE" && (
                  <p className="mt-1 text-xs text-white/45">
                    Remaining:{" "}
                    <span className="font-bold text-white">{access.limits.remaining}</span>{" "}
                    /{" "}
                    <span className="font-bold text-white">{access.limits.pitchesPerMonth}</span>
                  </p>
                )}

                {usage.plan === "TRIAL" && (
                  <p className="mt-1 text-xs text-white/45">
                    Unlimited - ends:{" "}
                    <span className="font-bold text-white">
                      {access.trialUntil
                        ? new Date(access.trialUntil).toLocaleString()
                        : "-"}
                    </span>
                  </p>
                )}

                {usage.plan === "PRO" && (
                  <p className="mt-1 text-xs font-semibold text-emerald-300">
                    Unlimited access
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                  Tracks
                </p>
                <p className="mt-1.5 text-2xl font-black text-white">{totalTracks}</p>
                <p className="mt-1 text-xs text-white/45">Total imported tracks</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
                  Matches
                </p>
                <p className="mt-1.5 text-2xl font-black text-white">{totalMatches}</p>
                <p className="mt-1 text-xs text-white/45">
                  Total matches across your tracks
                </p>
              </div>
            </div>
          </div>
        </section>
      )}



    </div>
  );
}
