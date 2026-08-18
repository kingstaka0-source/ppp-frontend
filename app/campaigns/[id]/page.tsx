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
  const { getToken, isLoaded } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) {
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
  }, [getToken, id, isLoaded]);

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
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/campaigns"
          className="text-sm font-black text-emerald-300 hover:text-emerald-200"
        >
          ← Back to Campaign History
        </Link>

        <div className="mt-7">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-black">
              {campaign.trackTitle}
            </h1>

            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
              {campaign.status}
            </span>
          </div>

          <p className="mt-2 text-white/55">
            {campaign.trackArtists.join(", ")}
          </p>

          <p className="mt-2 text-sm text-white/35">
            Started{" "}
            {new Date(campaign.createdAt).toLocaleString()}
          </p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Selected" value={campaign.selectedPlaylists} />
          <Metric label="Sent" value={campaign.emailsSent} />
          <Metric label="Opens" value={campaign.opens} />
          <Metric label="Clicks" value={campaign.clicks} />

          <Metric label="Replies" value={campaign.replies} />
          <Metric
            label="Interested"
            value={campaign.interestedCurators}
          />
          <Metric
            label="Placements"
            value={campaign.placements}
          />
          <Metric label="Failed" value={campaign.failed} />
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Rate label="Open rate" value={campaign.openRate} />
          <Rate label="Click rate" value={campaign.clickRate} />
          <Rate label="Reply rate" value={campaign.replyRate} />
          <Rate
            label="Placement rate"
            value={campaign.placementRate}
          />
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-[#0d0d0f] p-6">
          <h2 className="text-2xl font-black">
            Campaign activity
          </h2>

          {campaign.events.length > 0 && (
  <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
    <h3 className="text-lg font-black">
      Activity timeline
    </h3>

    <div className="mt-5 space-y-5">
      {campaign.events.map((event, index) => (
        <div
          key={event.id}
          className="relative flex gap-4"
        >
          <div className="flex flex-col items-center">
            <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-400" />

            {index < campaign.events.length - 1 && (
              <div className="mt-2 h-full min-h-10 w-px bg-white/10" />
            )}
          </div>

          <div className="pb-2">
            <p className="font-black text-white">
              {formatEventLabel(event.type)}
            </p>

            <p className="mt-1 text-sm text-white/40">
              {new Date(event.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

          <div className="mt-5 space-y-4">
            {campaign.items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                  <div className="max-w-3xl">
                    <h3 className="text-lg font-black">
                      {item.playlist?.name ||
                        "Unknown playlist"}
                    </h3>

                    <p className="mt-1 text-sm text-white/45">
                      Curator:{" "}
                      {item.playlist?.curator?.name ||
                        "Unknown"}
                    </p>

                    {item.pitch?.subject && (
                      <p className="mt-4 font-bold">
                        {item.pitch.subject}
                      </p>
                    )}

                    {item.pitch?.body && (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/60">
                        {item.pitch.body}
                      </p>
                    )}
                  </div>

                  <div className="min-w-[260px] space-y-2 text-sm">
                    <Status
                      label="Pitch"
                      value={item.pitch?.status || "NO PITCH"}
                    />

                    <Status
                      label="Sent"
                      value={formatDate(item.pitch?.sentAt)}
                    />

                    <Status
                      label="Opened"
                      value={
                        item.pitch?.openCount
                          ? `${item.pitch.openCount}x`
                          : "No"
                      }
                    />

                    <Status
                      label="Last opened"
                      value={formatDate(
                        item.pitch?.lastOpenedAt,
                      )}
                    />

                    <Status
                      label="Clicked"
                      value={
                        item.pitch?.clickCount
                          ? `${item.pitch.clickCount}x`
                          : "No"
                      }
                    />

                    <Status
                      label="Last clicked"
                      value={formatDate(
                        item.pitch?.lastClickedAt,
                      )}
                    />

                    <Status
                      label="Replies"
                      value={String(
                        item.pitch?.replyCount ?? 0,
                      )}
                    />

                    <Status
                      label="Interested"
                      value={
                        item.pitch?.positiveReply === true
                          ? "Yes"
                          : "No"
                      }
                    />

                    <Status
                      label="Playlisted"
                      value={
                        item.pitch?.playlistDetected
                          ? "Yes"
                          : "No"
                      }
                    />
                  </div>
                </div>

                {item.playlist?.spotifyPlaylistId && (
                  <a
                    href={`https://open.spotify.com/playlist/${item.playlist.spotifyPlaylistId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex text-sm font-black text-emerald-300"
                  >
                    Open playlist ↗
                  </a>
                )}
              </div>
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