"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LegalGate from "@/app/components/LegalGate";
import IntakeTrackCard from "@/app/components/IntakeTrackCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

type Usage = {
  artistId: string;
  plan: "FREE" | "TRIAL" | "PRO";
  trial: null | { until: string };
  month: { sentThisMonth: number; limit: number | null; remaining: number | null };
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
  };
  legal: LegalBlock;
  tracks: OverviewTrack[];
};

function daysLeft(untilIso?: string | null) {
  if (!untilIso) return null;
  const until = new Date(untilIso).getTime();
  const now = Date.now();
  const ms = until - now;
  const d = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return d;
}

export default function DashboardPage() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [legal, setLegal] = useState<LegalBlock | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    setErr(null);

    try {
      if (!ARTIST_ID) {
        throw new Error("Missing NEXT_PUBLIC_ARTIST_ID in your frontend env (.env.local).");
      }

      const [uRes, oRes] = await Promise.all([
        fetch(`${API}/artists/${ARTIST_ID}/usage`, { cache: "no-store" }),
        fetch(`${API}/dashboard/artist/${ARTIST_ID}/overview`, { cache: "no-store" }),
      ]);

      const uText = await uRes.text();
      const oText = await oRes.text();

      if (!uRes.ok) throw new Error(uText || `Usage HTTP ${uRes.status}`);
      if (!oRes.ok) throw new Error(oText || `Overview HTTP ${oRes.status}`);

      const u = JSON.parse(uText) as Usage;
      const o = JSON.parse(oText) as Overview;

      setUsage(u);
      setOverview(o);
      setLegal((o?.legal ?? null) as LegalBlock | null);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trialDaysLeft = useMemo(() => daysLeft(usage?.trial?.until ?? null), [usage?.trial?.until]);
  const showTrialBanner = usage?.plan === "TRIAL" && trialDaysLeft !== null;
  const showTrialWarning = usage?.plan === "TRIAL" && (trialDaysLeft ?? 999) <= 2;
  const showFreeLimitBanner = usage?.plan === "FREE" && (usage?.month?.remaining ?? 999) <= 1;

  const totalTracks = overview?.tracks?.length ?? 0;
  const totalMatches = (overview?.tracks ?? []).reduce((sum, t) => sum + (t.matchCount ?? 0), 0);

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      {/* ✅ Legal gate: blokkeert UI tot alles geaccepteerd is */}
      {!loading && !err && ARTIST_ID && (
        <LegalGate subjectType="ARTIST" subjectId={ARTIST_ID} legal={legal} onAccepted={loadAll} />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/pricing" className="px-4 py-2 rounded border border-black hover:bg-black hover:text-white transition">
            Pricing
          </Link>
          <Link href="/upgrade" className="px-4 py-2 rounded bg-black text-white hover:opacity-90 transition">
            Upgrade →
          </Link>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        API: {API} • Artist: {ARTIST_ID || "(missing NEXT_PUBLIC_ARTIST_ID)"}
      </div>

      {loading && <p>Loading…</p>}
      {err && <p className="text-red-600 whitespace-pre-wrap">Error: {err}</p>}

      {/* ✅ Intake + queue polling */}
      {!loading && !err && <IntakeTrackCard onDone={loadAll} />}

      {/* BANNERS */}
      {!loading && !err && usage && (
        <div className="space-y-3">
          {showTrialBanner && (
            <div className={`border rounded-xl p-4 ${showTrialWarning ? "bg-yellow-50" : ""}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">
                    TRIAL actief — nog {trialDaysLeft} dag{trialDaysLeft === 1 ? "" : "en"}.
                  </div>
                  <div className="text-sm text-gray-700">
                    {showTrialWarning
                      ? "Let op: je trial loopt bijna af. Als je wil doorgaan, zorg dat billing klaarstaat."
                      : "Je hebt nu unlimited pitches tijdens je trial."}
                  </div>
                </div>
                <Link href="/upgrade" className="px-4 py-2 rounded bg-black text-white hover:opacity-90 transition">
                  Manage trial →
                </Link>
              </div>
            </div>
          )}

          {showFreeLimitBanner && (
            <div className="border rounded-xl p-4 bg-yellow-50">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">Je FREE limiet is bijna op.</div>
                  <div className="text-sm text-gray-700">
                    Remaining deze maand: <b>{usage?.month?.remaining}</b> / <b>{usage?.month?.limit}</b>
                  </div>
                </div>
                <Link href="/upgrade" className="px-4 py-2 rounded bg-black text-white hover:opacity-90 transition">
                  Upgrade →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CARDS */}
      {!loading && !err && usage && overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-xl p-6">
            <div className="text-sm text-gray-600">Plan</div>
            <div className="text-3xl font-bold">{usage.plan}</div>

            {usage.plan === "FREE" && (
              <div className="mt-2 text-gray-700">
                Remaining: <b>{usage.month.remaining}</b> / <b>{usage.month.limit}</b>
              </div>
            )}

            {usage.plan === "TRIAL" && usage.trial && (
              <div className="mt-2 text-gray-700">
                Unlimited • ends: <b>{new Date(usage.trial.until).toLocaleString()}</b>
              </div>
            )}

            {usage.plan === "PRO" && <div className="mt-2 text-gray-700">Unlimited</div>}
          </div>

          <div className="border rounded-xl p-6">
            <div className="text-sm text-gray-600">Tracks</div>
            <div className="text-3xl font-bold">{totalTracks}</div>
            <div className="mt-2 text-gray-700">Totaal ingelezen tracks</div>
          </div>

          <div className="border rounded-xl p-6">
            <div className="text-sm text-gray-600">Matches</div>
            <div className="text-3xl font-bold">{totalMatches}</div>
            <div className="mt-2 text-gray-700">Totaal matches over je tracks</div>
          </div>
        </div>
      )}

      {/* RECENT TRACKS */}
{!loading && !err && overview && (
  <div className="border rounded-xl p-6">
    <div className="flex items-center justify-between">
      <div className="text-xl font-bold">Recent Tracks</div>
      <Link href="/tracks" className="text-sm underline">
        All tracks
      </Link>
    </div>

    {(overview.tracks ?? []).length === 0 ? (
      <div className="mt-4 text-sm text-gray-600">
        Nog geen tracks. Voeg er één toe via <b>Intake Track</b> hierboven.
      </div>
    ) : (
      <div className="mt-4 space-y-3">
        {(overview.tracks ?? []).slice(0, 5).map((t) => (
          <div key={t.id} className="flex items-center justify-between border rounded p-3">
            <div>
              <div className="font-semibold">{t.title}</div>
              <div className="text-sm text-gray-600">{(t.artists ?? []).join(", ")}</div>
              <div className="text-xs text-gray-500">matches: {t.matchCount}</div>
            </div>
            <Link className="px-3 py-2 rounded bg-black text-white" href={`/tracks/${t.id}`}>
              View →
            </Link>
          </div>
        ))}
      </div>
    )}
  </div>
)}

      {/* NAV */}
      <div className="flex gap-3 pt-2">
        <Link href="/tracks" className="px-4 py-2 rounded border border-black hover:bg-black hover:text-white transition">
          Tracks
        </Link>
        <Link href="/pitches" className="px-4 py-2 rounded bg-black text-white hover:opacity-90 transition">
          Pitches →
        </Link>
        <button onClick={loadAll} className="px-4 py-2 rounded border border-black hover:bg-black hover:text-white transition">
          Refresh
        </button>
      </div>
    </div>
  );
}