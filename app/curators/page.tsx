"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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
};

export default function CuratorsPage() {
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
      const res = await fetch(`${API}/curators/analytics`, {
        cache: "no-store",
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
      !c.email?.toLowerCase().includes(query)
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
    <main className="mx-auto max-w-6xl p-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold">Curator CRM</h1>
          <p className="mt-2 text-gray-600">
            Track curator outreach, opens, clicks, replies and interest.
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
            onClick={loadCurators}
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

      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Curators</p>
          <p className="mt-2 text-3xl font-bold">{filtered.length}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Sent</p>
          <p className="mt-2 text-3xl font-bold">{totals.sent}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Opens</p>
          <p className="mt-2 text-3xl font-bold">{totals.opens}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Clicks</p>
          <p className="mt-2 text-3xl font-bold">{totals.clicks}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Interested</p>
          <p className="mt-2 text-3xl font-bold">{totals.interested}</p>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold">Curators</h2>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search curator or email..."
            className="w-full rounded border px-4 py-2 md:max-w-sm"
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
  <button
    onClick={() => setShowOpened(!showOpened)}
    className={`rounded border px-3 py-1 text-sm ${
      showOpened ? "bg-black text-white" : "bg-white"
    }`}
  >
    Opened
  </button>

  <button
    onClick={() => setShowClicked(!showClicked)}
    className={`rounded border px-3 py-1 text-sm ${
      showClicked ? "bg-black text-white" : "bg-white"
    }`}
  >
    Clicked
  </button>

  <button
    onClick={() => setShowHasEmail(!showHasEmail)}
    className={`rounded border px-3 py-1 text-sm ${
      showHasEmail ? "bg-black text-white" : "bg-white"
    }`}
  >
    Has Email
  </button>

  <button
    onClick={() => setShowInterested(!showInterested)}
    className={`rounded border px-3 py-1 text-sm ${
      showInterested ? "bg-black text-white" : "bg-white"
    }`}
  >
    Interested
  </button>
</div>

        {loading ? (
          <p>Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600">No curators found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3">Curator</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Sent</th>
                  <th className="p-3">Opens</th>
                  <th className="p-3">Clicks</th>
                  <th className="p-3">Replies</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Interested</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{c.name || "-"}</td>
                    <td className="p-3 text-gray-600">{c.email || "-"}</td>
                    <td className="p-3">{c.sent}</td>
                    <td className="p-3">{c.opens}</td>
                    <td className="p-3">{c.clicks}</td>
                    <td className="p-3">{c.replies}</td>

<td className="p-3 font-bold">
  {c.score}
</td>

<td className="p-3">
  <span
    className={`rounded-full px-3 py-1 text-xs font-medium ${
      c.status === "HOT"
        ? "bg-red-100 text-red-700"
        : c.status === "WARM"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-gray-100 text-gray-600"
    }`}
  >
    {c.status}
  </span>
</td>

<td className="p-3">
                      {c.interested ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                          No
                        </span>
                      )}
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