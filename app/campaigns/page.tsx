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
    <main className="min-h-screen bg-black text-white">
      <div className="w-full">
        <section className="relative mb-0 min-h-[400px] overflow-hidden border-b border-white/10 bg-[#050909]">
          {/* Single continuous Campaigns hero photo */}
          <img
            src="/campaigns-hero.png"
            alt=""
            className="absolute inset-y-0 right-0 h-full w-auto max-w-none brightness-[0.72] saturate-[0.90] [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.15)_8%,rgba(0,0,0,0.55)_18%,black_32%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.15)_8%,rgba(0,0,0,0.55)_18%,black_32%)]"
          />

          {/* One continuous cinematic blend across the same photo */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#000_0%,#010806_18%,#02140d_30%,#032619_40%,rgba(4,48,29,0.88)_48%,rgba(5,62,35,0.58)_54%,rgba(5,54,32,0.28)_61%,rgba(3,31,20,0.10)_68%,transparent_76%)]" />
<div className="absolute inset-y-0 left-[47%] w-[18%] bg-emerald-950/25 blur-[45px]" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />

          <div className="absolute right-8 top-6 z-20 flex items-center gap-2">
            <a
              href="/dashboard"
              className="rounded-xl border border-white/15 bg-black/35 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-white/10"
            >
              Dashboard
            </a>

            <a
              href="/pitches"
              className="rounded-xl border border-white/15 bg-black/35 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-white/10"
            >
              Pitches
            </a>

            <a
              href="/followups"
              className="rounded-xl border border-white/15 bg-black/35 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-white/10"
            >
              Follow-ups
            </a>

            <a
              href="/curators"
              className="rounded-xl border border-white/15 bg-black/35 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:border-emerald-400/40 hover:bg-white/10"
            >
              Curators
            </a>
          </div>
          <div className="relative z-10 flex min-h-[400px] w-full flex-col justify-center px-10 py-10">
            <div className="max-w-[650px]">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-emerald-300">
                Campaigns
              </p>

              <h1 className="text-5xl font-black tracking-tight lg:text-6xl">
                Campaign History
              </h1>

              <p className="mt-4 text-lg text-white/70">
                Track every campaign from pitch to playlist placement.
              </p>
            </div>
          </div>
        </section>

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
          <section className="px-6 py-8 lg:px-10 lg:py-10">
            <div className="mx-auto max-w-[1600px]">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
                    Campaign activity
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                    Recent Campaigns
                  </h2>

                  <p className="mt-1 text-sm text-white/45">
                    Review performance and open a campaign for full playlist details.
                  </p>
                </div>

                <p className="text-sm font-bold text-white/35">
                  {campaigns.length} {campaigns.length === 1 ? "campaign" : "campaigns"}
                </p>
              </div>

              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <article
                    key={campaign.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d0d] transition hover:border-emerald-400/20"
                  >
                    <div className="flex flex-col gap-5 p-5 xl:flex-row xl:items-center">
                      <div className="min-w-0 xl:w-[28%]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300">
                            {campaign.status}
                          </span>

                          <span className="text-xs text-white/30">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="mt-3 truncate text-xl font-black text-white">
                          {campaign.trackTitle}
                        </h3>

                        <p className="mt-1 truncate text-sm text-white/45">
                          {campaign.trackArtists.length > 0
                            ? campaign.trackArtists.join(", ")
                            : "Unknown artist"}
                        </p>
                      </div>

                      <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 xl:min-w-[440px]">
                        <CompactMetric
                          label="Selected"
                          value={campaign.selectedPlaylists}
                        />

                        <CompactMetric
                          label="Sent"
                          value={campaign.emailsSent}
                        />

                        <CompactMetric
                          label="Opens"
                          value={campaign.opens}
                        />

                        <CompactMetric
                          label="Clicks"
                          value={campaign.clicks}
                        />

                        <CompactMetric
                          label="Placements"
                          value={campaign.placements}
                          accent
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-xs sm:grid-cols-4 xl:w-[330px] xl:shrink-0 xl:grid-cols-2">
                        <CompactRate
                          label="Open rate"
                          value={`${campaign.openRate}%`}
                        />

                        <CompactRate
                          label="Click rate"
                          value={`${campaign.clickRate}%`}
                        />

                        <CompactRate
                          label="Reply rate"
                          value={`${campaign.replyRate}%`}
                        />

                        <CompactRate
                          label="Placement"
                          value={`${campaign.placementRate}%`}
                        />
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
                        {campaign.spotifyUrl && (
                          <a
                            href={campaign.spotifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs font-black text-white/65 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                          >
                            Spotify ↗
                          </a>
                        )}

                        <a
                          href={`/campaigns/${campaign.id}`}
                          className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-2.5 text-xs font-black text-emerald-300 transition hover:bg-emerald-400/20"
                        >
                          View campaign →
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/[0.07] bg-black/20 px-5 py-3 text-[11px] text-white/30">
                      <span>Replies {campaign.replies}</span>
                      <span>Interested {campaign.interestedCurators}</span>
                      <span>Generated {campaign.generatedPitches}</span>
                      <span>Failed {campaign.failed}</span>
                      <span>Eligible {campaign.eligibleMatches}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function CompactMetric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/35 px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
        {label}
      </p>

      <p
        className={`mt-1 text-xl font-black ${
          accent ? "text-emerald-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function CompactRate({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] py-1.5">
      <span className="text-white/35">{label}</span>
      <span className="font-black text-emerald-300">{value}</span>
    </div>
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
