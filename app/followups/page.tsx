"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  const [items, setItems] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);

  async function loadFollowups() {
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch(`${API}/followups`, {
        cache: "no-store",
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = JSON.parse(text);
      setItems(json.followups ?? []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load follow-ups");
    } finally {
      setLoading(false);
    }
  }

  async function markSent(id: string) {
    try {
      setWorkingId(id);

      const res = await fetch(`${API}/followups/${id}/mark-sent`, {
        method: "POST",
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || `HTTP ${res.status}`);
      }

      await loadFollowups();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to mark follow-up sent");
    } finally {
      setWorkingId(null);
    }
  }

  useEffect(() => {
    loadFollowups();
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold">Follow-ups</h1>
          <p className="mt-2 text-gray-600">
            Curators who opened your pitch but have not replied yet.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="rounded border border-black px-4 py-2 hover:bg-black hover:text-white transition"
          >
            ← Dashboard
          </Link>

          <button
            onClick={loadFollowups}
            className="rounded bg-black px-4 py-2 text-white hover:opacity-90 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {err}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Follow-ups</p>
          <p className="mt-2 text-3xl font-bold">{items.length}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Total Opens</p>
          <p className="mt-2 text-3xl font-bold">
            {items.reduce((sum, item) => sum + item.openCount, 0)}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Total Clicks</p>
          <p className="mt-2 text-3xl font-bold">
            {items.reduce((sum, item) => sum + item.clickCount, 0)}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Replies</p>
          <p className="mt-2 text-3xl font-bold">
            {items.reduce((sum, item) => sum + item.replyCount, 0)}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Follow-up Queue</h2>

        {loading ? (
          <p className="mt-4">Loading…</p>
        ) : items.length === 0 ? (
          <div className="mt-4 rounded-xl border bg-gray-50 p-6 text-gray-700">
            No follow-ups due yet. A pitch becomes due when it was opened,
            has no reply, and was last opened more than 7 days ago.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3">Track</th>
                  <th className="p-3">Playlist</th>
                  <th className="p-3">Curator</th>
                  <th className="p-3">Sent To</th>
                  <th className="p-3">Opens</th>
                  <th className="p-3">Clicks</th>
                  <th className="p-3">Last Opened</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">
                      {item.track.title}
                      <div className="text-xs text-gray-500">
                        {(item.track.artists ?? []).join(", ")}
                      </div>
                    </td>

                    <td className="p-3">{item.playlist.name}</td>

                    <td className="p-3">
                      {item.curator?.name ?? "-"}
                      <div className="text-xs text-gray-500">
                        {item.curator?.email ?? ""}
                      </div>
                    </td>

                    <td className="p-3 text-gray-600">{item.sentTo ?? "-"}</td>
                    <td className="p-3">{item.openCount}</td>
                    <td className="p-3">{item.clickCount}</td>

                    <td className="p-3 text-gray-600">
                      {item.lastOpenedAt
                        ? new Date(item.lastOpenedAt).toLocaleString()
                        : "-"}
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => markSent(item.id)}
                        disabled={workingId === item.id}
                        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
                      >
                        {workingId === item.id ? "Saving..." : "Mark Sent"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}