"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

type CampaignItem = {
  id: string;
  matchId: string;
  pitchId: string | null;
  fitScore: number | null;

  playlist: {
    id: string;
    name: string;
    spotifyPlaylistId: string | null;
    genres: string[];

    curator: {
      id: string;
      name: string;
      email: string | null;
    } | null;
  } | null;

  pitch: {
    id: string;
    subject: string;
    body: string;
    status: string;

    sentTo: string | null;
    sentAt: string | null;

    openCount: number;
    clickCount: number;
    replyCount: number;

    positiveReply: boolean | null;
    negativeReply: boolean | null;

    playlistDetected: boolean;
    playlistedAt: string | null;

    lastOpenedAt: string | null;
    lastClickedAt: string | null;
    lastRepliedAt: string | null;
  } | null;

  createdAt: string;
};

type CampaignEvent = {
  id: string;
  campaignId: string;
  campaignItemId: string;
  pitchId: string | null;
  matchId: string;
  type:
    | "GENERATED"
    | "SENT"
    | "OPENED"
    | "CLICKED"
    | "REPLIED"
    | "INTERESTED"
    | "DECLINED"
    | "PLAYLISTED"
    | "SKIPPED_FAKE_EMAIL";
  createdAt: string;
  metadata: Record<string, unknown> | null;
};

type Campaign = {
  id: string;

  trackId: string;
  trackTitle: string;
  trackArtists: string[];
  spotifyTrackId: string | null;
  spotifyUrl: string | null;

  status: string;

  selectedPlaylists: number;
  eligibleMatches: number;
  generatedPitches: number;
  emailsSent: number;

  skippedAlreadySent: number;
  skippedNoEmail: number;
  skippedFakeEmail: number;
  failed: number;

  opens: number;
  clicks: number;
  replies: number;
  interestedCurators: number;
  negativeReplies: number;
  placements: number;

  openRate: number;
  clickRate: number;
  replyRate: number;
  placementRate: number;

  items: CampaignItem[];
  events: CampaignEvent[];

  createdAt: string;
  updatedAt: string;
};

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [replySaving, setReplySaving] = useState<string | null>(null);

  const [playlistSaving, setPlaylistSaving] =
  useState<string | null>(null);

async function markPlaylisted(
  campaignItemId: string,
) {
  try {
    setPlaylistSaving(campaignItemId);

    const token = await getToken();

    if (!token) {
      throw new Error(
        "Could not get authentication token.",
      );
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:3100";

    const response = await fetch(
      `${apiUrl}/campaigns/${encodeURIComponent(
        id,
      )}/items/${encodeURIComponent(
        campaignItemId,
      )}/playlist`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          `Could not mark playlist placement (${response.status}).`,
      );
    }

    window.location.reload();
  } catch (err) {
    alert(
      err instanceof Error
        ? err.message
        : "Could not mark playlist placement.",
    );
  } finally {
    setPlaylistSaving(null);
  }
}

async function markReply(
  campaignItemId: string,
  status: "INTERESTED" | "DECLINED",
) {
  try {
    setReplySaving(campaignItemId);

    const token = await getToken();

    if (!token) {
      throw new Error("Could not get authentication token.");
    }

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:3100";

    const response = await fetch(
      `${apiUrl}/campaigns/${encodeURIComponent(
        id,
      )}/items/${encodeURIComponent(
        campaignItemId,
      )}/reply`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          `Could not save reply (${response.status}).`,
      );
    }

    window.location.reload();
  } catch (err) {
    alert(
      err instanceof Error
        ? err.message
        : "Could not save curator reply.",
    );
  } finally {
    setReplySaving(null);
  }
}

  useEffect(() => {
  if (!isLoaded) {
    return;
  }

  if (!isSignedIn) {
    setLoading(false);
    setError("You must be signed in.");
    return;
  }

  async function loadCampaign() {
      try {
        setLoading(true);
        setError("");

        const token = await getToken();

        if (!token) {
          throw new Error("Could not get authentication token.");
        }

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "http://127.0.0.1:3100";

        const response = await fetch(
          `${apiUrl}/campaigns/${encodeURIComponent(id)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Could not load campaign (${response.status}).`,
          );
        }

        setCampaign(data.campaign ?? null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load campaign.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadCampaign();
  }, [getToken, id, isLoaded, isSignedIn]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-white/60">
            Loading campaign...
          </p>
        </div>
      </main>
    );
  }

  if (error || !campaign) {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/campaigns"
            className="text-sm font-bold text-emerald-300"
          >
            ← Back to campaigns
          </Link>

          <div className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
            {error || "Campaign not found."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-white/10 bg-[#090b0b] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <Link href="/dashboard" className="inline-flex">
                <img
                  src="/brand/logo.svg"
                  alt="TuneReach"
                  className="h-9 w-auto"
                />
              </Link>

              <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                Campaign Workspace
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  {campaign.trackTitle}
                </h1>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase text-emerald-300">
                  {campaign.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-white/55">
                {campaign.trackArtists.join(", ")}
              </p>

              <p className="mt-2 text-xs text-white/35">
                Started {new Date(campaign.createdAt).toLocaleString()}
              </p>
            </div>

            <nav className="flex shrink-0 flex-wrap items-center gap-2">
              <Link
                href="/dashboard"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-white/65 transition hover:bg-white/[0.08] hover:text-white"
              >
                Dashboard
              </Link>

              <Link
                href="/pitches"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-white/65 transition hover:bg-white/[0.08] hover:text-white"
              >
                Pitches
              </Link>

              <Link
                href="/followups"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-white/65 transition hover:bg-white/[0.08] hover:text-white"
              >
                Follow-ups
              </Link>

              <Link
                href="/curators"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-white/65 transition hover:bg-white/[0.08] hover:text-white"
              >
                Curators
              </Link>

              <Link
                href="/campaigns"
                className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3.5 py-2 text-sm font-black text-emerald-300 transition hover:bg-emerald-400/20"
              >
                Campaigns
              </Link>
            </nav>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
          <Metric label="Selected" value={campaign.selectedPlaylists} />
          <Metric label="Sent" value={campaign.emailsSent} />
          <Metric label="Opens" value={campaign.opens} />
          <Metric label="Clicks" value={campaign.clicks} />
          <Metric label="Replies" value={campaign.replies} />
          <Metric label="Interested" value={campaign.interestedCurators} />
          <Metric label="Placements" value={campaign.placements} />
          <Metric label="Failed" value={campaign.failed} />
        </section>

        <section className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Rate label="Open rate" value={campaign.openRate} />
          <Rate label="Click rate" value={campaign.clickRate} />
          <Rate label="Reply rate" value={campaign.replyRate} />
          <Rate label="Placement rate" value={campaign.placementRate} />
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-[#0d0d0f] p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                Campaign activity
              </p>
              <h2 className="mt-1 text-2xl font-black">
                Playlist performance
              </h2>
            </div>

            <p className="text-sm text-white/35">
              {campaign.items.length} playlist{campaign.items.length === 1 ? "" : "s"}
            </p>
          </div>

          {campaign.events.length > 0 && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex flex-wrap items-center gap-2">
                {campaign.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />

                    <div>
                      <p className="text-xs font-black text-white/80">
                        {formatEventLabel(event.type)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/35">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {campaign.items.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5"
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black">
                          {item.playlist?.name || "Unknown playlist"}
                        </h3>
                        <p className="mt-1 text-sm text-white/45">
                          Curator: {item.playlist?.curator?.name || "Unknown"}
                        </p>
                      </div>

                      <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase ${
                        item.pitch?.status === "SENT"
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                          : "border-white/10 bg-white/[0.04] text-white/45"
                      }`}>
                        {item.pitch?.status || "NO PITCH"}
                      </span>
                    </div>

                    {item.pitch ? (
                      <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                        {item.pitch.subject && (
                          <p className="font-bold text-white/90">
                            {item.pitch.subject}
                          </p>
                        )}

                        {item.pitch.body && (
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/55">
                            {item.pitch.body}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-white/[0.015] px-4 py-3">
                        <p className="text-sm text-white/35">
                          No pitch was generated for this playlist.
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {item.pitch?.positiveReply === true ? (
                        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-2 text-sm font-black text-emerald-300">
                          ✓ Interested
                        </div>
                      ) : item.pitch?.negativeReply === true ? (
                        <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-3.5 py-2 text-sm font-black text-red-300">
                          Declined
                        </div>
                      ) : item.pitch?.status === "SENT" ? (
                        <>
                          <button
                            type="button"
                            disabled={replySaving === item.id}
                            onClick={() => void markReply(item.id, "INTERESTED")}
                            className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-2 text-sm font-black text-emerald-300 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {replySaving === item.id ? "Saving..." : "Mark Interested"}
                          </button>

                          <button
                            type="button"
                            disabled={replySaving === item.id}
                            onClick={() => void markReply(item.id, "DECLINED")}
                            className="rounded-xl border border-red-400/20 bg-red-400/10 px-3.5 py-2 text-sm font-black text-red-300 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {replySaving === item.id ? "Saving..." : "Mark Declined"}
                          </button>
                        </>
                      ) : null}

                      {item.pitch?.playlistDetected === true ? (
                        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-2 text-sm font-black text-emerald-300">
                          ✓ Playlisted
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={playlistSaving === item.id}
                          onClick={() => void markPlaylisted(item.id)}
                          className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3.5 py-2 text-sm font-black text-cyan-300 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {playlistSaving === item.id ? "Saving..." : "Mark Playlisted"}
                        </button>
                      )}

                      {item.playlist?.spotifyPlaylistId && (
                        <a
                          href={`https://open.spotify.com/playlist/${item.playlist.spotifyPlaylistId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-0 inline-flex rounded-xl border border-white/10 px-3.5 py-2 text-sm font-black text-emerald-300 transition hover:bg-white/[0.04] sm:ml-auto"
                        >
                          Open playlist ↗
                        </a>
                      )}
                    </div>
                  </div>

                  {item.pitch && (
                  <aside className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2 text-sm">
                    <Status label="Pitch" value={item.pitch?.status || "NO PITCH"} />
                    <Status label="Sent" value={formatDate(item.pitch?.sentAt)} />
                    <Status
                      label="Opened"
                      value={item.pitch?.openCount ? `${item.pitch.openCount}x` : "No"}
                    />
                    <Status label="Last opened" value={formatDate(item.pitch?.lastOpenedAt)} />
                    <Status
                      label="Clicked"
                      value={item.pitch?.clickCount ? `${item.pitch.clickCount}x` : "No"}
                    />
                    <Status label="Last clicked" value={formatDate(item.pitch?.lastClickedAt)} />
                    <Status label="Replies" value={String(item.pitch?.replyCount ?? 0)} />
                    <Status
                      label="Interested"
                      value={item.pitch?.positiveReply === true ? "Yes" : "No"}
                    />
                    <Status
                      label="Playlisted"
                      value={item.pitch?.playlistDetected ? "Yes" : "No"}
                    />
                  </aside>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0d0f] p-5">
      <p className="text-sm text-white/40">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

function Rate({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-5">
      <p className="text-sm text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-black text-emerald-300">
        {value}%
      </p>
    </div>
  );
}

function Status({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-white/5 py-2">
      <span className="text-white/40">{label}</span>
      <span className="font-bold text-white/75">
        {value}
      </span>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

function formatEventLabel(type: CampaignEvent["type"]) {
  switch (type) {
    case "GENERATED":
      return "AI pitch generated";

    case "SENT":
      return "Email sent";

    case "OPENED":
      return "Email opened";

    case "CLICKED":
      return "Spotify link clicked";

    case "REPLIED":
      return "Curator replied";

    case "INTERESTED":
      return "Curator interested";

    case "DECLINED":
      return "Curator declined";

    case "PLAYLISTED":
      return "Added to playlist";

    case "SKIPPED_FAKE_EMAIL":
      return "Fake/test email skipped";

    default:
      return type;
  }
}
