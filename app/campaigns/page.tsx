"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

type CampaignItem = {
  id: string;
  matchId: string;
  pitchId: string | null;

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

export default function CampaignsPage() {
  const { getToken, isLoaded } = useAuth();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    async function loadCampaigns() {
      try {
        setLoading(true);
        setError(null);

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

        const token = await getToken();

        if (!token) {
          throw new Error("Could not get authentication token.");
        }

        const response = await fetch(`${apiUrl}/campaigns`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Could not load campaigns (${response.status})`,
          );
        }

        const data = await response.json();

        setCampaigns(
          Array.isArray(data)
            ? data
            : Array.isArray(data.campaigns)
              ? data.campaigns
              : [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load campaign history.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadCampaigns();
  }, [getToken, isLoaded]);

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
            TuneReach
          </p>

          <h1 className="text-4xl font-black tracking-tight">
            Campaign History
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-white/55">
            Review every campaign and track opens, Spotify clicks,
            curator replies and playlist placements.
          </p>
        </div>

        {loading && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-white/60">
            Loading campaigns...
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && campaigns.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="text-xl font-black">
              No campaigns yet
            </h2>

            <p className="mt-2 text-white/60">
              Completed campaigns will appear here automatically.
            </p>
          </div>
        )}

        {!loading && !error && campaigns.length > 0 && (
          <div className="space-y-7">
            {campaigns.map((campaign) => (
              <section
  key={campaign.id}
  className="rounded-3xl border border-white/10 bg-[#0d0d0f] p-6 lg:p-7"
>
  <div className="mb-5 flex justify-end">
    <a
      href={`/campaigns/${campaign.id}`}
      className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-black text-emerald-300 transition hover:bg-emerald-400/15"
    >
      View campaign →
    </a>
  </div>
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-black">
                        {campaign.trackTitle}
                      </h2>

                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300">
                        {campaign.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-white/55">
                      {campaign.trackArtists.length > 0
                        ? campaign.trackArtists.join(", ")
                        : "Unknown artist"}
                    </p>

                    <p className="mt-2 text-xs text-white/30">
                      {new Date(campaign.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Metric
                      label="Selected"
                      value={campaign.selectedPlaylists}
                    />
                    <Metric
                      label="Sent"
                      value={campaign.emailsSent}
                    />
                    <Metric
                      label="Opens"
                      value={campaign.opens}
                    />
                    <Metric
                      label="Clicks"
                      value={campaign.clicks}
                    />
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <RateCard
                    label="Open rate"
                    value={`${campaign.openRate}%`}
                  />

                  <RateCard
                    label="Click rate"
                    value={`${campaign.clickRate}%`}
                  />

                  <RateCard
                    label="Reply rate"
                    value={`${campaign.replyRate}%`}
                  />

                  <RateCard
                    label="Placement rate"
                    value={`${campaign.placementRate}%`}
                  />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Metric
                    label="Replies"
                    value={campaign.replies}
                  />

                  <Metric
                    label="Interested"
                    value={campaign.interestedCurators}
                  />

                  <Metric
                    label="Placements"
                    value={campaign.placements}
                  />

                  <Metric
                    label="Failed"
                    value={campaign.failed}
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-sm text-white/45">
                  <span>
                    Generated: {campaign.generatedPitches}
                  </span>

                  <span>
                    Already sent: {campaign.skippedAlreadySent}
                  </span>

                  <span>
                    No email: {campaign.skippedNoEmail}
                  </span>

                  <span>
                    Fake email: {campaign.skippedFakeEmail}
                  </span>

                  <span>
                    Eligible: {campaign.eligibleMatches}
                  </span>
                </div>

                {campaign.spotifyUrl && (
                  <a
                    href={campaign.spotifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex text-sm font-black text-emerald-300 hover:text-emerald-200"
                  >
                    Open track on Spotify ↗
                  </a>
                )}

                {campaign.items.length > 0 && (
                  <div className="mt-7 border-t border-white/10 pt-6">
                    <h3 className="text-lg font-black">
                      Campaign playlists
                    </h3>

                    <div className="mt-4 space-y-3">
                      {campaign.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-white/10 bg-black/30 p-5"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <p className="font-black">
                                {item.playlist?.name ||
                                  "Unknown playlist"}
                              </p>

                              <p className="mt-1 text-sm text-white/45">
                                Curator:{" "}
                                {item.playlist?.curator?.name ||
                                  "Unknown"}
                              </p>

                              {item.pitch?.subject && (
                                <p className="mt-3 max-w-3xl text-sm text-white/55">
                                  {item.pitch.subject}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs">
                              <Badge
                                text={
                                  item.pitch?.status || "NO PITCH"
                                }
                              />

                              <Badge
                                text={`Opened ${item.pitch?.openCount ?? 0}x`}
                              />

                              <Badge
                                text={`Clicked ${item.pitch?.clickCount ?? 0}x`}
                              />

                              <Badge
                                text={`Replies ${item.pitch?.replyCount ?? 0}`}
                              />

                              {item.pitch?.positiveReply === true && (
                                <Badge text="Interested" />
                              )}

                              {item.pitch?.playlistDetected === true && (
                                <Badge text="Playlisted" />
                              )}
                            </div>
                          </div>

                          {item.playlist?.spotifyPlaylistId && (
                            <a
                              href={`https://open.spotify.com/playlist/${item.playlist.spotifyPlaylistId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 inline-flex text-sm font-bold text-emerald-300 hover:text-emerald-200"
                            >
                              Open playlist ↗
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
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
    <div className="min-w-[110px] rounded-2xl border border-white/10 bg-black px-4 py-4">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function RateCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-4">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 text-xl font-black text-emerald-300">
        {value}
      </p>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-white/55">
      {text}
    </span>
  );
}