"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import LegalGate from "@/app/components/LegalGate";
import IntakeTrackCard from "@/app/components/IntakeTrackCard";
import AccountSwitcher from "@/app/components/AccountSwitcher";

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
  const searchParams = useSearchParams();
  const resolvedArtistId =
    searchParams.get("artistId")?.trim() || DEFAULT_ARTIST_ID;

  const [artistId, setArtistId] = useState<string>(resolvedArtistId);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [legal, setLegal] = useState<LegalBlock | null>(null);
  const [access, setAccess] = useState<BillingAccess | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function loadAll(currentArtistId: string) {
    setArtistId(currentArtistId);
    setLoading(true);
    setErr(null);

    try {
      if (!currentArtistId) {
        throw new Error(
          "Missing artistId. Add ?artistId=... in the URL or set NEXT_PUBLIC_ARTIST_ID."
        );
      }

      const [uRes, oRes, aRes] = await Promise.all([
        fetch(`${API}/artists/${currentArtistId}/usage`, {
          cache: "no-store",
          headers: { "x-artist-id": currentArtistId },
        }),
        fetch(`${API}/dashboard/artist/${currentArtistId}/overview`, {
          cache: "no-store",
          headers: { "x-artist-id": currentArtistId },
        }),
        fetch(
          `${API}/billing/access?artistId=${encodeURIComponent(currentArtistId)}`,
          {
            cache: "no-store",
            headers: { "x-artist-id": currentArtistId },
          }
        ),
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

      setUsage(u);
      setOverview(o);
      setLegal((o?.legal ?? null) as LegalBlock | null);
      setAccess(a?.access ?? null);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setArtistId(resolvedArtistId);
    loadAll(resolvedArtistId);
  }, [resolvedArtistId]);

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

const totalCampaigns = analytics?.totalCampaigns ?? 0;
const totalSentPitches = analytics?.totalSentPitches ?? 0;
const totalPlacements = analytics?.totalPlacements ?? 0;
const placementRate = analytics?.placementRate ?? 0;

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      {!loading && !err && artistId && (
        <LegalGate
          subjectType="ARTIST"
          subjectId={artistId}
          legal={legal}
          onAccepted={() => loadAll(artistId)}
        />
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Dashboard</h1>

          <div className="flex flex-wrap items-center gap-2">
            {usage?.plan ? <PlanBadge plan={usage.plan} /> : null}

            {access?.subscriptionStatus ? (
              <span className="inline-flex rounded-full border px-3 py-1 text-sm text-gray-700">
                Status: {access.subscriptionStatus}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={linkWithArtistId("/pricing", artistId)}
            className="px-4 py-2 rounded border border-black hover:bg-black hover:text-white transition"
          >
            Pricing
          </Link>

          {usage?.plan === "PRO" ? (
  <Link
    href={linkWithArtistId("/upgrade", artistId)}
    className="px-4 py-2 rounded bg-green-600 text-white"
  >
    PRO Active ✓
  </Link>
) : (
  <Link
    href={linkWithArtistId("/upgrade", artistId)}
    className="px-4 py-2 rounded bg-black text-white hover:opacity-90 transition"
  >
    Upgrade →
  </Link>
)}
        </div>
      </div>

      <AccountSwitcher />

      <div className="text-sm text-gray-600">
        API: {API} • Artist: {artistId || "(missing artistId)"}
      </div>

      {!loading && !err && overview && (
  <section className="rounded-2xl border bg-white p-6 shadow-sm">
    <div className="flex flex-col gap-1">
      <h2 className="text-2xl font-semibold">Campaign Analytics</h2>
      <p className="text-sm text-gray-600">
        Track your pitching activity and placement performance.
      </p>
    </div>

    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {[
    ["Campaigns", overview.analytics?.totalCampaigns ?? 0, "Campaign runs created"],
    ["Sent", overview.analytics?.sentCount ?? 0, "Emails sent to curators"],
    ["Drafts", overview.analytics?.draftCount ?? 0, "Ready to edit/send"],
    ["Queued", overview.analytics?.queuedCount ?? 0, "Waiting to send"],
    ["Placements", overview.analytics?.totalPlacements ?? 0, "Detected playlist adds"],
    ["Placement Rate", `${overview.analytics?.placementRate ?? 0}%`, "Placements / sent pitches"],
    ["Reply Rate", `${overview.analytics?.replyRate ?? 0}%`, "Email replies"],
    ["Open Rate", `${overview.analytics?.openRate ?? 0}%`, "Email opens"],
    ["Click Rate", `${overview.analytics?.clickRate ?? 0}%`, "Spotify link clicks"],
    ["Interested Curators", overview.analytics?.interestedCurators ?? 0, "Positive responses"],
    ["Total Opens", overview.analytics?.totalOpens ?? 0, "Tracked email opens"],
    ["Total Clicks", overview.analytics?.totalClicks ?? 0, "Tracked Spotify clicks"],
  ].map(([label, value, sub]) => (
    <div key={label} className="rounded-xl border bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{sub}</p>
    </div>
  ))}
</div>
  </section>
)}

{!loading && !err && overview?.analytics && (
  <section className="rounded-2xl border bg-white p-6 shadow-sm">
    <h2 className="text-2xl font-semibold">Advanced Analytics</h2>

    <div className="mt-5 grid gap-4 md:grid-cols-2">

      <div className="rounded-xl border p-4">
        <div className="text-sm text-gray-500">
          Top Performing Track
        </div>
        <div className="mt-2 text-xl font-bold">
          {overview.analytics.topPerformingTrack?.title ?? "-"}
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <div className="text-sm text-gray-500">
          Most Pitched Track
        </div>
        <div className="mt-2 text-xl font-bold">
          {overview.analytics.mostPitchedTrack?.title ?? "-"}
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <div className="text-sm text-gray-500">
          Best Playlist Category
        </div>
        <div className="mt-2 text-xl font-bold">
          {overview.analytics.bestPlaylistCategory?.category ?? "-"}
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <div className="text-sm text-gray-500">
          Top Curator Source
        </div>
        <div className="mt-2 text-xl font-bold">
          {overview.analytics.topCuratorSources?.[0]?.source ?? "-"}
        </div>
      </div>

    </div>

    <div className="mt-6 rounded-xl border p-4">
      <h3 className="font-semibold mb-3">
        Conversion Funnel
      </h3>

      <div className="grid grid-cols-4 gap-4">

        <div>
          <div className="text-xs text-gray-500">Drafts</div>
          <div className="text-2xl font-bold">
            {overview.analytics.conversionFunnel?.drafts ?? 0}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500">Queued</div>
          <div className="text-2xl font-bold">
            {overview.analytics.conversionFunnel?.queued ?? 0}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500">Sent</div>
          <div className="text-2xl font-bold">
            {overview.analytics.conversionFunnel?.sent ?? 0}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500">Placements</div>
          <div className="text-2xl font-bold">
            {overview.analytics.conversionFunnel?.placements ?? 0}
          </div>
        </div>

      </div>

      <div className="mt-4 text-sm text-gray-600">
        Draft → Queue:
        {" "}
        {overview.analytics.conversionFunnel?.draftToQueuedRate ?? 0}%
        {" • "}
        Queue → Sent:
        {" "}
        {overview.analytics.conversionFunnel?.queuedToSentRate ?? 0}%
        {" • "}
        Sent → Placement:
        {" "}
        {overview.analytics.conversionFunnel?.sentToPlacementRate ?? 0}%
      </div>
    </div>
  </section>
)}

      {loading && <p>Loading…</p>}
      {err && <p className="text-red-600 whitespace-pre-wrap">Error: {err}</p>}

      {!loading && !err && <IntakeTrackCard artistId={artistId} onDone={() => loadAll(artistId)} />}

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
                    TRIAL actief — nog {trialDaysLeft} dag
                    {trialDaysLeft === 1 ? "" : "en"}.
                  </div>
                  <div className="text-sm text-gray-700">
                    {showTrialWarning
                      ? "Let op: je trial loopt bijna af. Regel je billing als je unlimited toegang wilt houden."
                      : "Je hebt nu unlimited pitches en campaign launch tijdens je trial."}
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
                  <div className="font-semibold">Je FREE limiet is bijna op.</div>
                  <div className="text-sm text-gray-700">
                    Remaining deze maand: <b>{usage.month.remaining}</b> /{" "}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-xl p-6">
            <div className="text-sm text-gray-600">Plan</div>
            <div className="mt-2 text-3xl font-bold">{usage.plan}</div>

            {usage.plan === "FREE" && (
              <div className="mt-2 text-gray-700">
                Remaining: <b>{access.limits.remaining}</b> /{" "}
                <b>{access.limits.pitchesPerMonth}</b>
              </div>
            )}

            {usage.plan === "TRIAL" && (
              <div className="mt-2 text-gray-700">
                Unlimited • ends:{" "}
                <b>
                  {access.trialUntil
                    ? new Date(access.trialUntil).toLocaleString()
                    : "—"}
                </b>
              </div>
            )}

            {usage.plan === "PRO" && <div className="mt-2 text-gray-700">Unlimited</div>}
          </div>

          <div className="border rounded-xl p-6">
            <div className="text-sm text-gray-600">Tracks</div>
            <div className="mt-2 text-3xl font-bold">{totalTracks}</div>
            <div className="mt-2 text-gray-700">Totaal ingelezen tracks</div>
          </div>

          <div className="border rounded-xl p-6">
            <div className="text-sm text-gray-600">Matches</div>
            <div className="mt-2 text-3xl font-bold">{totalMatches}</div>
            <div className="mt-2 text-gray-700">Totaal matches over je tracks</div>
          </div>
        </div>
      )}

      {!loading && !err && access && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-xl p-4">
            <div className="text-sm text-gray-600">Create pitch</div>
            <div className="mt-2 font-semibold">
              {access.features.canCreatePitch ? "Enabled" : "Locked"}
            </div>
          </div>

          <div className="border rounded-xl p-4">
            <div className="text-sm text-gray-600">Launch campaign</div>
            <div className="mt-2 font-semibold">
              {access.features.canLaunchCampaign ? "Enabled" : "PRO / TRIAL only"}
            </div>
          </div>

          <div className="border rounded-xl p-4">
            <div className="text-sm text-gray-600">Bulk queue</div>
            <div className="mt-2 font-semibold">
              {access.features.canBulkQueue ? "Enabled" : "PRO / TRIAL only"}
            </div>
          </div>

          <div className="border rounded-xl p-4">
            <div className="text-sm text-gray-600">Auto send</div>
            <div className="mt-2 font-semibold">
              {access.features.canAutoSend ? "Enabled" : "PRO / TRIAL only"}
            </div>
          </div>
        </div>
      )}

      {!loading && !err && overview && (
        <div className="border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold">Recent Tracks</div>
            <Link
              href={linkWithArtistId("/tracks", artistId)}
              className="text-sm underline"
            >
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
                <div
                  key={t.id}
                  className="flex items-center justify-between border rounded p-3"
                >
                  <div>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-sm text-gray-600">
                      {(t.artists ?? []).join(", ")}
                    </div>
                    <div className="text-xs text-gray-500">
                      matches: {t.matchCount}
                    </div>
                  </div>

                  <Link
                    className="px-3 py-2 rounded bg-black text-white"
                    href={linkWithArtistId(`/tracks/${t.id}`, artistId)}
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Link
          href={linkWithArtistId("/tracks", artistId)}
          className="px-4 py-2 rounded border border-black hover:bg-black hover:text-white transition"
        >
          Tracks
        </Link>

        <Link
          href={linkWithArtistId("/pitches", artistId)}
          className="px-4 py-2 rounded bg-black text-white hover:opacity-90 transition"
        >
          Pitches →
        </Link>

        <Link
  href="/curators"
  className="px-4 py-2 rounded border border-black hover:bg-black hover:text-white transition"
>
  Curators
</Link>

        <Link
  href="/followups"
  className="px-4 py-2 rounded border border-black hover:bg-black hover:text-white transition"
>
  Follow-ups
</Link>

<button
  onClick={() => loadAll(artistId)}
  className="px-4 py-2 rounded border border-black hover:bg-black hover:text-white transition"
>
  Refresh
</button>
      </div>
    </div>
  );
}