"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";

type PitchRow = {
  id: string;
  matchId: string;
  subject: string;
  body: string;
  status: "DRAFT" | "QUEUED" | "SENT";
  channel: "INAPP" | "EMAIL";
  createdAt: string;
  sentAt?: string | null;
  sentTo?: string | null;
  deliveryStatus?: string | null;
  deliveredAt?: string | null;
  openCount?: number;
  clickCount?: number;
  playlistDetected?: boolean;
  match?: {
    id: string;
    trackId: string;
    playlistId: string;
    track?: {
      id: string;
      title: string;
      spotifyTrackId?: string | null;
      spotifyUrl?: string | null;
      artists?: string[];
      albumImageUrl?: string | null;
    } | null;
    playlist?: {
      id: string;
      name: string;
      spotifyPlaylistId?: string | null;
      spotifyUrl?: string | null;
      genres?: string[];
      curator?: {
        id: string;
        name: string | null;
        email?: string | null;
        contactMethod?: string;
        consent?: boolean;
        canEmail?: boolean;
      } | null;
    } | null;
  } | null;
  track?: {
    id: string;
    title: string;
    spotifyTrackId?: string | null;
    spotifyUrl?: string | null;
    artists?: string[];
    albumImageUrl?: string | null;
  } | null;
  playlist?: {
    id: string;
    name: string;
    spotifyPlaylistId?: string | null;
    spotifyUrl?: string | null;
    genres?: string[];
  } | null;
  curator?: {
    id: string;
    name: string | null;
    email?: string | null;
    contactMethod?: string;
    consent?: boolean;
    canEmail?: boolean;
  } | null;
  playlistDetails?: {
    id: string;
    name: string;
    followers: number;
    imageUrl?: string | null;
    spotifyUrl?: string | null;
  } | null;
};

type PitchesApiResponse = {
  ok?: boolean;
  count?: number;
  pitches?: PitchRow[];
  error?: string;
  message?: string;
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

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString();
}

function PlanBadge({ plan }: { plan: "FREE" | "TRIAL" | "PRO" }) {
  const styles =
    plan === "PRO"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : plan === "TRIAL"
      ? "border-sky-400/20 bg-sky-400/10 text-sky-300"
      : "border-amber-400/20 bg-amber-400/10 text-amber-300";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${styles}`}>
      {plan}
    </span>
  );
}

function PaywallNotice({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-gray-700">{message}</p>
        </div>

        <Link
          href="/upgrade"
          className="inline-flex items-center justify-center rounded border border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white"
        >
          Upgrade to PRO
        </Link>
      </div>
    </div>
  );
}

export default function PitchesPage() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pitches, setPitches] = useState<PitchRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [accessLoading, setAccessLoading] = useState(true);
  const [access, setAccess] = useState<BillingAccess | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);

  const [status, setStatus] = useState<"ALL" | "SENT" | "DELIVERED" | "OPENED" | "DRAFT" | "QUEUED">("ALL");
  const [playlistId, setPlaylistId] = useState<string>("ALL");
  const [curatorId, setCuratorId] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  async function loadPitches() {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("You must be signed in.");
      }

      const res = await fetch(`${API}/pitches/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const json = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setPitches(Array.isArray(json) ? json : []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load pitches");
      setPitches([]);
    } finally {
      setLoading(false);
    }
  }
  async function loadAccess() {
    setAccessLoading(true);
    setAccessError(null);

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("You must be signed in.");
      }

      const res = await fetch(`${API}/billing/access`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const json: BillingAccessResponse = await res.json().catch(() => ({}));

      if (!res.ok || !json.access) {
        throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
      }

      setAccess(json.access);
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : "Failed to load billing access");
      setAccess(null);
    } finally {
      setAccessLoading(false);
    }
  }
  async function refreshAll() {
    await Promise.all([loadPitches(), loadAccess()]);
  }

  useEffect(() => {
    refreshAll();
  }, []);

  const playlistOptions = useMemo(() => {
    const map = new Map<string, string>();

    for (const pitch of pitches) {
     const playlist = pitch.playlist ?? pitch.match?.playlist ?? null;
      if (playlist?.id) {
        map.set(playlist.id, playlist.name || playlist.id);
      }
    }

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [pitches]);

  const curatorOptions = useMemo(() => {
    const map = new Map<string, string>();

    for (const pitch of pitches) {
      const curator =
  pitch.curator ?? pitch.match?.playlist?.curator ?? null;
      if (curator?.id) {
        map.set(curator.id, curator.name || curator.id);
      }
    }

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [pitches]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return pitches.filter((pitch) => {
      if (status !== "ALL" && getDisplayStatus(pitch) !== status) return false;

      const track = pitch.track ?? pitch.match?.track ?? null;
      const playlist = pitch.playlist ?? pitch.match?.playlist ?? null;
      const curator = pitch.curator ?? pitch.match?.playlist?.curator ?? null;

      if (playlistId !== "ALL" && playlist?.id !== playlistId) return false;
      if (curatorId !== "ALL" && curator?.id !== curatorId) return false;

      if (query) {
        const searchable = [
          track?.title,
          ...(track?.artists ?? []),
          playlist?.name,
          curator?.name,
          curator?.email,
          pitch.sentTo,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(query)) return false;
      }

      return true;
    });
  }, [pitches, status, playlistId, curatorId, search]);

  const metrics = useMemo(() => {
    const sentPitches = pitches.filter(
      (pitch) => pitch.status === "SENT" || Boolean(pitch.sentAt),
    );

    const delivered = pitches.filter(
      (pitch) =>
        Boolean(pitch.deliveredAt) ||
        pitch.deliveryStatus?.toUpperCase() === "DELIVERED",
    ).length;

    const totalOpens = pitches.reduce(
      (sum, pitch) => sum + (pitch.openCount ?? 0),
      0,
    );

    const totalClicks = pitches.reduce(
      (sum, pitch) => sum + (pitch.clickCount ?? 0),
      0,
    );

    const reachedPlaylists = new Set(
      sentPitches
        .map(
          (pitch) =>
            pitch.playlistDetails?.id ??
            pitch.playlist?.id ??
            pitch.match?.playlist?.id ??
            null,
        )
        .filter((id): id is string => Boolean(id)),
    ).size;

    return {
      sent: sentPitches.length,
      delivered,
      opens: totalOpens,
      clicks: totalClicks,
      playlistsReached: reachedPlaylists,
    };
  }, [pitches]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const paginatedPitches = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [status, playlistId, curatorId, search]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  function getDisplayStatus(pitch: PitchRow) {
    if ((pitch.openCount ?? 0) > 0) return "OPENED";

    if (
      pitch.deliveredAt ||
      pitch.deliveryStatus?.toUpperCase() === "DELIVERED"
    ) {
      return "DELIVERED";
    }

    return pitch.status;
  }

  const showFreeBanner =
    access?.plan === "FREE" &&
    typeof access.limits.pitchesPerMonth === "number";

  const limitReached =
    access?.plan === "FREE" && access.features.canCreatePitch === false;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/pitches-hero.png')] bg-cover bg-[position:center_48%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.91)_0%,rgba(9,9,11,0.76)_34%,rgba(9,9,11,0.40)_68%,rgba(9,9,11,0.58)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,11,0.18)_0%,rgba(9,9,11,0.30)_58%,rgb(9,9,11)_100%)]"
        />

        <div className="relative z-10 mx-auto max-w-[1500px] px-5 py-8 md:px-8 md:py-10">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <img
              src="/brand/logo.svg"
              alt="TuneReach"
              className="h-9 w-auto"
            />

            <div className="flex flex-wrap justify-end gap-2">
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm font-medium text-zinc-200 backdrop-blur transition hover:border-white/30 hover:bg-white/10"
              >
                Dashboard
              </Link>

              <Link
                href="/followups"
                className="rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm font-medium text-zinc-200 backdrop-blur transition hover:border-white/30 hover:bg-white/10"
              >
                Follow-ups
              </Link>

              <Link
                href="/curators"
                className="rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm font-medium text-zinc-200 backdrop-blur transition hover:border-white/30 hover:bg-white/10"
              >
                Curators
              </Link>

              <Link
                href="/campaigns"
                className="rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm font-medium text-zinc-200 backdrop-blur transition hover:border-white/30 hover:bg-white/10"
              >
                Campaigns
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {access?.plan ? <PlanBadge plan={access.plan} /> : null}

                {access?.subscriptionStatus ? (
                  <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
                    Status: {access.subscriptionStatus}
                  </span>
                ) : null}
              </div>

              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Pitches
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
                View, track and manage all your playlist pitches.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {access?.plan && access.plan !== "PRO" ? (
                <Link
                  href="/upgrade"
                  className="inline-flex items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/15"
                >
                  ♛ Upgrade plan
                </Link>
              ) : null}

              <Link
                href="/tracks"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-white"
              >
                Track workspace →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] space-y-6 px-5 py-7 md:px-8 md:py-9">
        {accessLoading ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 px-5 py-4 text-sm text-zinc-400">
            Loading plan access...
          </div>
        ) : null}

        {accessError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {accessError}
          </div>
        ) : null}

        {showFreeBanner && access ? (
          <PaywallNotice
            title="Free plan pitch limit"
            message={`You have used ${access.limits.createdThisMonth} of ${access.limits.pitchesPerMonth} pitches this month.`}
          />
        ) : null}

        {limitReached ? (
          <PaywallNotice
            title="Monthly pitch limit reached"
            message="Upgrade your plan to create and send more pitches."
          />
        ) : null}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Total pitches sent",
              value: metrics.sent,
              icon: "↗",
              iconClass: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
            },
            {
              label: "Delivered",
              value: metrics.delivered,
              icon: "✉",
              iconClass: "text-sky-300 bg-sky-400/10 border-sky-400/20",
            },
            {
              label: "Total opens",
              value: metrics.opens,
              icon: "◉",
              iconClass: "text-violet-300 bg-violet-400/10 border-violet-400/20",
            },
            {
              label: "Total clicks",
              value: metrics.clicks,
              icon: "↗",
              iconClass: "text-orange-300 bg-orange-400/10 border-orange-400/20",
            },
            {
              label: "Playlists reached",
              value: metrics.playlistsReached,
              icon: "≡",
              iconClass: "text-zinc-300 bg-white/5 border-white/10",
            },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.13em] text-zinc-500">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                    {metric.value}
                  </p>
                </div>

                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-bold ${metric.iconClass}`}
                >
                  {metric.icon}
                </span>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[180px_220px_220px_minmax(280px,1fr)_auto]">
            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as
                    | "ALL"
                    | "SENT"
                    | "DELIVERED"
                    | "OPENED"
                    | "DRAFT"
                    | "QUEUED",
                )
              }
              className="h-11 rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none transition focus:border-emerald-400/50"
            >
              <option value="ALL">All statuses</option>
              <option value="SENT">Sent</option>
              <option value="DELIVERED">Delivered</option>
              <option value="OPENED">Opened</option>
              <option value="DRAFT">Draft</option>
              <option value="QUEUED">Queued</option>
            </select>

            <select
              value={playlistId}
              onChange={(event) => setPlaylistId(event.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none transition focus:border-emerald-400/50"
            >
              <option value="ALL">All playlists</option>
              {playlistOptions.map((playlist) => (
                <option key={playlist.id} value={playlist.id}>
                  {playlist.name}
                </option>
              ))}
            </select>

            <select
              value={curatorId}
              onChange={(event) => setCuratorId(event.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none transition focus:border-emerald-400/50"
            >
              <option value="ALL">All curators</option>
              {curatorOptions.map((curator) => (
                <option key={curator.id} value={curator.id}>
                  {curator.name}
                </option>
              ))}
            </select>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tracks, playlists, curators or email..."
              className="h-11 rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/50"
            />

            <button
              type="button"
              onClick={refreshAll}
              disabled={loading || accessLoading}
              className="h-11 rounded-xl bg-emerald-400 px-5 text-sm font-bold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60">
          <div className="overflow-x-auto">
            <table className="min-w-[1280px] w-full text-left">
              <thead className="border-b border-white/10 bg-black/20">
                <tr className="text-[11px] font-semibold uppercase tracking-[0.13em] text-zinc-500">
                  <th className="px-4 py-4">Track</th>
                  <th className="px-4 py-4">Playlist</th>
                  <th className="px-4 py-4">Curator</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">Sent To</th>
                  <th className="px-4 py-4">Channel</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Sent At</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.07]">
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-14 text-center text-sm text-zinc-500"
                    >
                      Loading pitches...
                    </td>
                  </tr>
                ) : paginatedPitches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-14 text-center text-sm text-zinc-500"
                    >
                      No pitches match these filters.
                    </td>
                  </tr>
                ) : (
                  paginatedPitches.map((pitch) => {
                    const track = pitch.track ?? pitch.match?.track ?? null;
                    const playlist =
                      pitch.playlist ?? pitch.match?.playlist ?? null;
                    const curator =
                      pitch.curator ??
                      pitch.match?.playlist?.curator ??
                      null;

                    const playlistImage = pitch.playlistDetails?.imageUrl ?? null;
                    const playlistFollowers =
                      pitch.playlistDetails?.followers ?? 0;
                    const playlistUrl =
                      pitch.playlistDetails?.spotifyUrl ??
                      playlist?.spotifyUrl ??
                      null;

                    const displayStatus = getDisplayStatus(pitch);

                    const statusClass =
                      displayStatus === "OPENED"
                        ? "border-violet-400/20 bg-violet-400/10 text-violet-300"
                        : displayStatus === "DELIVERED"
                          ? "border-sky-400/20 bg-sky-400/10 text-sky-300"
                          : displayStatus === "SENT"
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : displayStatus === "QUEUED"
                              ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                              : "border-white/10 bg-white/5 text-zinc-300";

                    return (
                      <tr
                        key={pitch.id}
                        className="transition hover:bg-white/[0.025]"
                      >
                        <td className="px-4 py-4">
                          <div className="flex min-w-[190px] items-center gap-3">
                            {track?.albumImageUrl ? (
                              <img
                                src={track.albumImageUrl}
                                alt=""
                                className="h-11 w-11 rounded-lg object-cover ring-1 ring-white/10"
                              />
                            ) : (
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-zinc-800 text-xs text-zinc-500">
                                ♪
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="max-w-[170px] truncate text-sm font-semibold text-white">
                                {track?.title ?? "Unknown track"}
                              </p>
                              <p className="mt-1 max-w-[170px] truncate text-xs text-zinc-500">
                                {track?.artists?.join(", ") || "Unknown artist"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex min-w-[210px] items-center gap-3">
                            {playlistImage ? (
                              <img
                                src={playlistImage}
                                alt=""
                                className="h-10 w-10 rounded-lg object-cover ring-1 ring-white/10"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-zinc-800 text-xs text-zinc-500">
                                ≡
                              </div>
                            )}

                            <div className="min-w-0">
                              {playlistUrl ? (
                                <a
                                  href={playlistUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block max-w-[190px] truncate text-sm font-medium text-zinc-200 transition hover:text-emerald-300"
                                >
                                  {playlist?.name ?? "Unknown playlist"}
                                </a>
                              ) : (
                                <p className="max-w-[190px] truncate text-sm font-medium text-zinc-200">
                                  {playlist?.name ?? "Unknown playlist"}
                                </p>
                              )}

                              <p className="mt-1 text-xs text-zinc-500">
                                {playlistFollowers.toLocaleString()} followers
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex min-w-[150px] items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-xs font-bold text-emerald-300">
                              {(curator?.name ?? "?")
                                .split(" ")
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase()}
                            </div>
                            <span className="max-w-[150px] truncate text-sm text-zinc-200">
                              {curator?.name ?? "—"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-zinc-400">
                          <span className="block max-w-[210px] truncate">
                            {curator?.email ?? "—"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-zinc-400">
                          <span className="block max-w-[210px] truncate">
                            {pitch.sentTo ?? "—"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-zinc-300">
                            {pitch.channel}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] ${statusClass}`}
                          >
                            {displayStatus}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-xs leading-5 text-zinc-400">
                          {pitch.sentAt ? (
                            <>
                              <span className="block">
                                {new Date(pitch.sentAt).toLocaleDateString()}
                              </span>
                              <span className="block text-zinc-600">
                                {new Date(pitch.sentAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/pitches/${pitch.id}`}
                              className="inline-flex h-8 items-center rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-zinc-200 transition hover:border-emerald-400/30 hover:text-emerald-300"
                            >
                              View
                            </Link>

                            {track?.id ? (
                              <Link
                                href={`/tracks/${track.id}`}
                                aria-label="Open track"
                                title="Open track"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sm text-zinc-400 transition hover:border-emerald-400/30 hover:text-white"
                              >
                                ⋯
                              </Link>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              Showing{" "}
              <span className="font-semibold text-zinc-300">
                {filtered.length === 0
                  ? 0
                  : (page - 1) * pageSize + 1}
              </span>
              {" – "}
              <span className="font-semibold text-zinc-300">
                {Math.min(page * pageSize, filtered.length)}
              </span>
              {" of "}
              <span className="font-semibold text-zinc-300">
                {filtered.length}
              </span>{" "}
              pitches
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="h-8 rounded-lg border border-white/10 px-3 text-xs font-semibold text-zinc-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .slice(
                  Math.max(0, page - 3),
                  Math.max(0, page - 3) + 5,
                )
                .map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={
                      pageNumber === page
                        ? "h-8 min-w-8 rounded-lg bg-emerald-400 px-2 text-xs font-bold text-zinc-950"
                        : "h-8 min-w-8 rounded-lg border border-white/10 px-2 text-xs font-semibold text-zinc-400 transition hover:text-white"
                    }
                  >
                    {pageNumber}
                  </button>
                ))}

              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages}
                className="h-8 rounded-lg border border-white/10 px-3 text-xs font-semibold text-zinc-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
