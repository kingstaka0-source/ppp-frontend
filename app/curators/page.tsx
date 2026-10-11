"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

type CuratorAnalytics = {
  id: string;
  name: string;
  email: string | null;
  sent: number;
  opens: number;
  clicks: number;
  replies: number;
  interested: boolean;
  score: number;
  status: string;
  playlist: {
    id: string;
    name: string;
    genres: string[];
    followers: number;
    imageUrl: string | null;
    spotifyUrl: string | null;
  } | null;
};

export default function CuratorsPage() {
  const { getToken } = useAuth();

  const [curators, setCurators] = useState<CuratorAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [showOpened, setShowOpened] = useState(false);
const [showClicked, setShowClicked] = useState(false);
const [showHasEmail, setShowHasEmail] = useState(false);
const [showInterested, setShowInterested] = useState(false);

  async function loadCurators() {
    setLoading(true);
    setErr(null);

    try {
      const token = await getToken();

if (!token) {
  throw new Error("You must be signed in.");
}

const res = await fetch(`${API}/curators/analytics`, {
  cache: "no-store",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || `HTTP ${res.status}`);
      }

      setCurators(JSON.parse(text));
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load curators");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCurators();
  }, []);

  const filtered = useMemo(() => {
  const query = q.trim().toLowerCase();

  return curators.filter((c) => {
    if (
      query &&
      !c.name?.toLowerCase().includes(query) &&
      !c.email?.toLowerCase().includes(query) &&
      !c.playlist?.name?.toLowerCase().includes(query)
    ) {
      return false;
    }

    if (showOpened && c.opens <= 0) {
      return false;
    }

    if (showClicked && c.clicks <= 0) {
      return false;
    }

    if (showHasEmail && !c.email) {
      return false;
    }

    if (showInterested && !c.interested) {
      return false;
    }

    return true;
  });
}, [
  curators,
  q,
  showOpened,
  showClicked,
  showHasEmail,
  showInterested,
]);

    
  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, c) => {
        acc.sent += c.sent || 0;
        acc.opens += c.opens || 0;
        acc.clicks += c.clicks || 0;
        acc.replies += c.replies || 0;
        if (c.interested) acc.interested += 1;
        return acc;
      },
      {
        sent: 0,
        opens: 0,
        clicks: 0,
        replies: 0,
        interested: 0,
      }
    );
  }, [filtered]);

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl space-y-7">
        <header className="rounded-2xl border border-white/10 bg-[#090b0b] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-5">
              <Link
                href="/dashboard"
                className="shrink-0"
                aria-label="TuneReach dashboard"
              >
                <img
                  src="/brand/logo.svg"
                  alt="TuneReach"
                  className="h-auto w-[185px] sm:w-[205px]"
                />
              </Link>

              <div className="hidden h-11 w-px shrink-0 bg-white/10 sm:block" />

              <div className="min-w-0">
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-[28px]">
                  Curator CRM
                </h1>

                <p className="mt-1 text-sm text-white/40">
                  Manage curator outreach, playlist contacts and campaign engagement.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 hidden text-xs font-bold uppercase tracking-[0.14em] text-white/25 xl:inline">
                {filtered.length} contacts
              </span>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-white/65 transition hover:bg-white/[0.08] hover:text-white"
              >
                Dashboard
              </Link>

              <Link
                href="/followups"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-white/65 transition hover:bg-white/[0.08] hover:text-white"
              >
                Follow-ups
              </Link>

              <button
                type="button"
                onClick={loadCurators}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-2 text-sm font-black text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </header>

        {err && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-bold text-red-200">
            {err}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              label: "Curators",
              value: filtered.length,
              description: "Visible contacts",
              icon: (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
            },
            {
              label: "Sent",
              value: totals.sent,
              description: "Pitches delivered",
              icon: (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m22 2-7 20-4-9-9-4Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 11 13" />
                </svg>
              ),
            },
            {
              label: "Opens",
              value: totals.opens,
              description: "Tracked opens",
              icon: (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ),
            },
            {
              label: "Clicks",
              value: totals.clicks,
              description: "Tracked clicks",
              icon: (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7h3a5 5 0 0 1 0 10h-3M9 17H6A5 5 0 0 1 6 7h3M8 12h8" />
                </svg>
              ),
            },
            {
              label: "Interested",
              value: totals.interested,
              description: "Positive replies",
              icon: (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8 11 2.5 2.5L16 8" />
                </svg>
              ),
            },
          ].map((metric) => (
            <div
              key={metric.label}
              className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:border-emerald-400/20 hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="pt-1 text-xs font-black uppercase tracking-[0.16em] text-white/40">
                  {metric.label}
                </p>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300">
                  {metric.icon}
                </span>
              </div>

              <p className="mt-2 text-3xl font-black tracking-tight text-white">
                {metric.value}
              </p>

              <p className="mt-1 text-sm text-white/40">
                {metric.description}
              </p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950">
          <div className="border-b border-white/10 p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-400">
                  Outreach database
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  Curators
                </h2>
              </div>

              <p className="text-sm font-medium text-white/35">
                {filtered.length} of {curators.length} curators shown
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <svg
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="m20 20-4-4" />
                </svg>

                <input
                  id="curator-search"
                  aria-label="Search curators"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search curator, playlist or email..."
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: "Opened",
                    active: showOpened,
                    toggle: () => setShowOpened(!showOpened),
                  },
                  {
                    label: "Clicked",
                    active: showClicked,
                    toggle: () => setShowClicked(!showClicked),
                  },
                  {
                    label: "Has Email",
                    active: showHasEmail,
                    toggle: () => setShowHasEmail(!showHasEmail),
                  },
                  {
                    label: "Interested",
                    active: showInterested,
                    toggle: () => setShowInterested(!showInterested),
                  },
                ].map((filter) => (
                  <button
                    key={filter.label}
                    type="button"
                    onClick={filter.toggle}
                    aria-pressed={filter.active}
                    className={`h-10 rounded-xl border px-3.5 text-xs font-bold transition ${
                      filter.active
                        ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-300"
                        : "border-white/10 bg-white/[0.035] text-white/55 hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center p-8">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-emerald-400" />
                <p className="mt-4 text-sm font-bold text-white/45">
                  Loading curators...
                </p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-black text-white">No curators found</p>
              <p className="mt-2 text-sm text-white/40">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.025]">
                    {[
                      "Curator / Playlist",
                      "Email",
                      "Followers",
                      "Engagement",
                      "Status",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-3 py-4 text-xs font-black uppercase tracking-[0.1em] text-white/35"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-white/[0.07] transition last:border-b-0 hover:bg-white/[0.025]"
                    >
                      <td className="w-[28%] px-3 py-4">
                        <div className="flex items-center gap-3">
                          {c.playlist?.imageUrl ? (
                            <img
                              src={c.playlist.imageUrl}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-lg border border-white/10 object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-sm font-black text-emerald-300">
                              {(c.name || "C").charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate font-black text-white">
                              {c.name || "Unknown curator"}
                            </p>

                            {c.playlist ? (
                              c.playlist.spotifyUrl ? (
                                <a
                                  href={c.playlist.spotifyUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-1 block max-w-[190px] truncate text-xs font-bold text-emerald-300 transition hover:text-emerald-200"
                                >
                                  {c.playlist.name}
                                </a>
                              ) : (
                                <p className="mt-1 max-w-[190px] truncate text-xs text-white/40">
                                  {c.playlist.name}
                                </p>
                              )
                            ) : (
                              <p className="mt-1 text-xs text-white/25">
                                No playlist
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        {c.email ? (
                          <span className="text-white/60">{c.email}</span>
                        ) : (
                          <span className="text-white/25">No email</span>
                        )}
                      </td>

                      <td className="px-3 py-4">
                        <span className="font-black text-white">
                          {(c.playlist?.followers ?? 0).toLocaleString()}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex items-center gap-1">
                          <span
                            title="Sent"
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-1.5 py-1 text-[11px] font-bold text-white/55"
                          >
                            S {c.sent}
                          </span>
                          <span
                            title="Opens"
                            className={`rounded-lg border px-1.5 py-1 text-[11px] font-bold ${
                              c.opens > 0
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : "border-white/10 bg-white/[0.04] text-white/35"
                            }`}
                          >
                            O {c.opens}
                          </span>
                          <span
                            title="Clicks"
                            className={`rounded-lg border px-1.5 py-1 text-[11px] font-bold ${
                              c.clicks > 0
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : "border-white/10 bg-white/[0.04] text-white/35"
                            }`}
                          >
                            C {c.clicks}
                          </span>
                          <span
                            title="Replies"
                            className={`rounded-lg border px-1.5 py-1 text-[11px] font-bold ${
                              c.replies > 0
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : "border-white/10 bg-white/[0.04] text-white/35"
                            }`}
                          >
                            R {c.replies}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${
                              c.status === "HOT"
                                ? "border-red-400/20 bg-red-400/10 text-red-300"
                                : c.status === "WARM"
                                  ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                                  : "border-white/10 bg-white/[0.04] text-white/45"
                            }`}
                          >
                            {c.status}
                          </span>

                          <span className="text-xs font-black text-white/55">
                            {c.score}
                          </span>

                          {c.interested && (
                            <span
                              title="Positive reply"
                              className="h-2 w-2 rounded-full bg-emerald-400"
                            />
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        {c.interested ? (
                          <span className="whitespace-nowrap text-xs font-bold text-emerald-300">
                            Positive reply
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const token = await getToken();

                                if (!token) {
                                  throw new Error("You must be signed in.");
                                }

                                const res = await fetch(
                                  `${API}/curators/${c.id}/positive-reply`,
                                  {
                                    method: "POST",
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  }
                                );

                                const text = await res.text();

                                if (!res.ok) {
                                  throw new Error(text || `HTTP ${res.status}`);
                                }

                                await loadCurators();
                              } catch (e: any) {
                                setErr(
                                  e?.message ??
                                    "Failed to mark positive reply"
                                );
                              }
                            }}
                            className="whitespace-nowrap rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-2 text-[11px] font-black text-emerald-300 transition hover:bg-emerald-400/20"
                          >
                            Mark positive
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}