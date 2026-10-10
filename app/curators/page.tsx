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
        <header className="overflow-hidden rounded-[24px] border border-white/10 bg-[#090b0b]">
          <div className="flex flex-col gap-5 border-b border-white/10 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-6">
              <Link
                href="/dashboard"
                className="shrink-0"
                aria-label="TuneReach dashboard"
              >
                <img
                  src="/brand/logo.svg"
                  alt="TuneReach"
                  className="h-auto w-[210px] sm:w-[235px]"
                />
              </Link>

              <div className="hidden h-10 w-px bg-white/10 lg:block" />

              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                  Curator workspace
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Curator CRM
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              >
                ← Dashboard
              </Link>

              <Link
                href="/followups"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
              >
                Follow-ups
              </Link>

              <button
                type="button"
                onClick={loadCurators}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-2.5 text-sm font-black text-emerald-300 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/45">
              Manage curator outreach, playlist contacts and campaign engagement.
            </p>

            <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/25">
              {filtered.length} curator contacts
            </span>
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
            },
            {
              label: "Sent",
              value: totals.sent,
              description: "Pitches delivered",
            },
            {
              label: "Opens",
              value: totals.opens,
              description: "Tracked opens",
            },
            {
              label: "Clicks",
              value: totals.clicks,
              description: "Tracked clicks",
            },
            {
              label: "Interested",
              value: totals.interested,
              description: "Positive replies",
            },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                {metric.label}
              </p>
              <p className="mt-3 text-3xl font-black text-white">
                {metric.value}
              </p>
              <p className="mt-2 text-sm text-white/40">
                {metric.description}
              </p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950">
          <div className="border-b border-white/10 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-400">
                  Outreach database
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  Curators
                </h2>
                <p className="mt-1 text-sm text-white/40">
                  {filtered.length} of {curators.length} curators shown
                </p>
              </div>

              <div className="w-full lg:max-w-md">
                <label
                  htmlFor="curator-search"
                  className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-white/35"
                >
                  Search
                </label>

                <input
                  id="curator-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search curator or email..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
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
                  className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                    filter.active
                      ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-300"
                      : "border-white/10 bg-white/[0.035] text-white/55 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
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
              <table className="w-full border-collapse text-left text-sm">
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
                        className="px-4 py-4 text-xs font-black uppercase tracking-[0.12em] text-white/35"
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
                      <td className="min-w-[280px] px-4 py-4">
                        <div className="flex items-center gap-3">
                          {c.playlist?.imageUrl ? (
                            <img
                              src={c.playlist.imageUrl}
                              alt=""
                              className="h-12 w-12 shrink-0 rounded-xl border border-white/10 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-black text-emerald-300">
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
                                  className="mt-1 block max-w-[230px] truncate text-xs font-bold text-emerald-300 transition hover:text-emerald-200"
                                >
                                  {c.playlist.name}
                                </a>
                              ) : (
                                <p className="mt-1 max-w-[230px] truncate text-xs text-white/40">
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

                      <td className="px-4 py-4">
                        {c.email ? (
                          <span className="text-white/60">{c.email}</span>
                        ) : (
                          <span className="text-white/25">No email</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-black text-white">
                          {(c.playlist?.followers ?? 0).toLocaleString()}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex min-w-[170px] items-center gap-2">
                          <span
                            title="Sent"
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-bold text-white/55"
                          >
                            S {c.sent}
                          </span>
                          <span
                            title="Opens"
                            className={`rounded-lg border px-2 py-1 text-xs font-bold ${
                              c.opens > 0
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : "border-white/10 bg-white/[0.04] text-white/35"
                            }`}
                          >
                            O {c.opens}
                          </span>
                          <span
                            title="Clicks"
                            className={`rounded-lg border px-2 py-1 text-xs font-bold ${
                              c.clicks > 0
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : "border-white/10 bg-white/[0.04] text-white/35"
                            }`}
                          >
                            C {c.clicks}
                          </span>
                          <span
                            title="Replies"
                            className={`rounded-lg border px-2 py-1 text-xs font-bold ${
                              c.replies > 0
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : "border-white/10 bg-white/[0.04] text-white/35"
                            }`}
                          >
                            R {c.replies}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${
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

                      <td className="px-4 py-4">
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
                            className="whitespace-nowrap rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-300 transition hover:bg-emerald-400/20"
                          >
                            Mark positive reply
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