"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

type FollowUp = {
  id: string;
  subject: string;
  sentTo: string | null;
  sentAt: string | null;
  openCount: number;
  clickCount: number;
  replyCount: number;
  lastOpenedAt: string | null;
  followUpSent: boolean;
  followUpSentAt: string | null;
  track: {
    id: string;
    title: string;
    artists: string[];
  };
  playlist: {
    id: string;
    name: string;
  };
  curator: {
    id: string;
    name: string;
    email: string | null;
  } | null;
};

export default function FollowupsPage() {
  const { getToken } = useAuth();

  const [items, setItems] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  async function loadFollowups() {
    setLoading(true);
    setErr(null);

    try {
      const token = await getToken();

if (!token) {
  throw new Error("You must be signed in.");
}

const res = await fetch(`${API}/followups`, {
  cache: "no-store",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = JSON.parse(text);
      setItems(json.followups ?? []);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load follow-ups");
    } finally {
      setLoading(false);
    }
  }

  async function generateFollowup(id: string) {
    try {
      setGeneratingId(id);
      setSelectedId(id);
      setDraftSubject("");
      setDraftBody("");
      setErr(null);

      const token = await getToken();

      if (!token) {
        throw new Error("You must be signed in.");
      }

      const res = await fetch(`${API}/followups/${id}/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = JSON.parse(text);

      setDraftSubject(data.subject ?? "");
      setDraftBody(data.body ?? "");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to generate follow-up");
    } finally {
      setGeneratingId(null);
    }
  }
  async function markSent(id: string) {
    try {
      setWorkingId(id);

      const token = await getToken();

if (!token) {
  throw new Error("You must be signed in.");
}

const res = await fetch(`${API}/followups/${id}/send`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || `HTTP ${res.status}`);
      }

      await loadFollowups();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to mark follow-up sent");
    } finally {
      setWorkingId(null);
    }
  }

  useEffect(() => {
    loadFollowups();
  }, []);

  const selectedItem =
    items.find((item) => item.id === selectedId) ?? null;

  const totalOpens = items.reduce(
    (sum, item) => sum + item.openCount,
    0
  );

  const totalClicks = items.reduce(
    (sum, item) => sum + item.clickCount,
    0
  );

  const totalReplies = items.reduce(
    (sum, item) => sum + item.replyCount,
    0
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/followups-hero.png')] bg-cover bg-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.94)_0%,rgba(9,9,11,0.78)_38%,rgba(9,9,11,0.42)_72%,rgba(9,9,11,0.66)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,11,0.16)_0%,rgba(9,9,11,0.30)_58%,rgb(9,9,11)_100%)]"
        />

        <div className="relative z-10 mx-auto max-w-[1500px] px-5 py-8 md:px-8 md:py-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
                Follow-ups
              </p>

              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Follow-ups
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 md:text-base">
                Curators who opened your pitch but have not replied yet.
              </p>
            </div>

            <img
              src="/brand/logo.svg"
              alt="TuneReach"
              className="h-9 w-auto shrink-0 md:h-10"
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-sm font-medium text-zinc-200 backdrop-blur transition hover:border-white/30 hover:bg-white/10"
            >
              ← Dashboard
            </Link>

            <button
              onClick={loadFollowups}
              disabled={loading}
              className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] space-y-6 px-5 py-7 md:px-8">
        {err && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {err}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Follow-ups
            </p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-3xl font-bold">{items.length}</p>
              <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                Queue
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-500">Needs your attention</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Total Opens
            </p>
            <p className="mt-3 text-3xl font-bold">{totalOpens}</p>
            <p className="mt-2 text-xs text-zinc-500">From follow-up queue</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Total Clicks
            </p>
            <p className="mt-3 text-3xl font-bold">{totalClicks}</p>
            <p className="mt-2 text-xs text-zinc-500">Links clicked</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Replies
            </p>
            <p className="mt-3 text-3xl font-bold">{totalReplies}</p>
            <p className="mt-2 text-xs text-zinc-500">Recorded replies</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">Follow-up Queue</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Opened pitches that may need another touch.
                </p>
              </div>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                {items.length} {items.length === 1 ? "follow-up" : "follow-ups"}
              </span>
            </div>

            {loading ? (
              <div className="px-5 py-14 text-center text-sm text-zinc-500">
                Loading follow-ups...
              </div>
            ) : items.length === 0 ? (
              <div className="m-5 rounded-xl border border-white/10 bg-black/20 p-6 text-sm leading-6 text-zinc-400">
                No follow-ups due yet. A pitch becomes due when it was opened,
                has no reply, and was last opened more than 7 days ago.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-[0.12em] text-zinc-500">
                      <th className="px-5 py-3 font-medium">Track</th>
                      <th className="px-4 py-3 font-medium">Playlist</th>
                      <th className="px-4 py-3 font-medium">Curator</th>
                      <th className="px-4 py-3 text-center font-medium">Opens</th>
                      <th className="px-4 py-3 text-center font-medium">Clicks</th>
                      <th className="px-4 py-3 font-medium">Last Opened</th>
                      <th className="px-5 py-3 font-medium">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item) => {
                      const isSelected = selectedId === item.id;

                      return (
                        <tr
                          key={item.id}
                          onClick={() => {
                            if (selectedId !== item.id) {
                              setDraftSubject("");
                              setDraftBody("");
                            }

                            setSelectedId(item.id);
                          }}
                          className={`cursor-pointer border-b border-white/[0.06] transition last:border-b-0 ${
                            isSelected
                              ? "bg-emerald-400/[0.08]"
                              : "hover:bg-white/[0.035]"
                          }`}
                        >
                          <td className="px-5 py-4">
                            <p className="max-w-[210px] truncate font-medium text-white">
                              {item.track.title}
                            </p>
                            <p className="mt-1 max-w-[210px] truncate text-xs text-zinc-500">
                              {(item.track.artists ?? []).join(", ") || "Unknown artist"}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="max-w-[180px] truncate text-zinc-200">
                              {item.playlist.name}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="max-w-[170px] truncate text-zinc-200">
                              {item.curator?.name ?? "Unknown curator"}
                            </p>
                            <p className="mt-1 max-w-[170px] truncate text-xs text-zinc-500">
                              {item.curator?.email ?? item.sentTo ?? "No email"}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-center font-medium text-zinc-200">
                            {item.openCount}
                          </td>

                          <td className="px-4 py-4 text-center font-medium text-zinc-200">
                            {item.clickCount}
                          </td>

                          <td className="px-4 py-4 text-xs text-zinc-400">
                            {item.lastOpenedAt
                              ? new Date(item.lastOpenedAt).toLocaleString()
                              : "-"}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  generateFollowup(item.id);
                                }}
                                disabled={generatingId === item.id}
                                className="rounded-lg border border-emerald-400/30 bg-emerald-400/[0.06] px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/10 disabled:opacity-50"
                              >
                                {generatingId === item.id
                                  ? "Generating..."
                                  : "Generate"}
                              </button>

                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  markSent(item.id);
                                }}
                                disabled={workingId === item.id}
                                className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:opacity-50"
                              >
                                {workingId === item.id ? "Saving..." : "Mark Sent"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="self-start rounded-2xl border border-white/10 bg-zinc-900/70 xl:sticky xl:top-6">
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Follow-up Draft</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Generate a follow-up and review it here.
                  </p>
                </div>

                {selectedItem && (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                    Selected
                  </span>
                )}
              </div>
            </div>

            {!selectedItem ? (
              <div className="px-5 py-14 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-emerald-300">
                  ↗
                </div>
                <p className="mt-4 text-sm font-medium text-zinc-300">
                  Select a follow-up
                </p>
                <p className="mx-auto mt-2 max-w-[280px] text-xs leading-5 text-zinc-500">
                  Choose a row from the queue or press Generate to prepare a draft.
                </p>
              </div>
            ) : (
              <div className="space-y-5 p-5">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="font-medium text-white">
                    {selectedItem.track.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {(selectedItem.track.artists ?? []).join(", ") || "Unknown artist"}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs">
                    <div>
                      <p className="text-zinc-600">Playlist</p>
                      <p className="mt-1 truncate text-zinc-300">
                        {selectedItem.playlist.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-zinc-600">Curator</p>
                      <p className="mt-1 truncate text-zinc-300">
                        {selectedItem.curator?.name ?? "Unknown curator"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-zinc-400">
                    Subject
                  </label>
                  <input
                    value={draftSubject}
                    onChange={(event) => setDraftSubject(event.target.value)}
                    placeholder="Generate a follow-up to create a subject"
                    className="w-full rounded-xl border border-white/10 bg-black/25 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-zinc-400">
                    Message
                  </label>
                  <textarea
                    value={draftBody}
                    onChange={(event) => setDraftBody(event.target.value)}
                    placeholder="Generate a follow-up to create the message"
                    rows={12}
                    className="w-full resize-y rounded-xl border border-white/10 bg-black/25 px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/40"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <button
                    onClick={() => generateFollowup(selectedItem.id)}
                    disabled={generatingId === selectedItem.id}
                    className="rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:opacity-50"
                  >
                    {generatingId === selectedItem.id
                      ? "Generating..."
                      : "Generate Follow-up"}
                  </button>

                  <button
                    onClick={() => markSent(selectedItem.id)}
                    disabled={workingId === selectedItem.id}
                    className="rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/[0.07] disabled:opacity-50"
                  >
                    {workingId === selectedItem.id
                      ? "Saving..."
                      : "Mark as Sent"}
                  </button>
                </div>

                <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
                  <p className="text-xs font-semibold text-zinc-300">
                    Follow-up details
                  </p>

                  <div className="mt-3 space-y-2 text-xs text-zinc-500">
                    <div className="flex justify-between gap-4">
                      <span>Sent to</span>
                      <span className="max-w-[240px] truncate text-right text-zinc-400">
                        {selectedItem.sentTo ?? selectedItem.curator?.email ?? "-"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span>Opens</span>
                      <span className="text-zinc-400">{selectedItem.openCount}</span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span>Clicks</span>
                      <span className="text-zinc-400">{selectedItem.clickCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
