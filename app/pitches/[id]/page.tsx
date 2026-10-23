// app/pitches/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

type Curator = {
  id: string;
  name: string;
  email?: string | null;
  contactMethod?: string | null;
  submissionUrl?: string | null;
  websiteUrl?: string | null;
  instagramUrl?: string | null;
};

type Playlist = {
  id: string;
  name: string;
  spotifyPlaylistId?: string | null;
  spotifyUrl?: string | null;
  curator?: Curator | null;
};

type Pitch = {
  id: string;
  matchId: string;
  subject: string;
  body: string;
  channel: "EMAIL" | "INAPP";
  status: "DRAFT" | "QUEUED" | "SENT";

  createdAt?: string | null;
  updatedAt?: string | null;

  sentAt?: string | null;
  sentTo?: string | null;

  providerMessageId?: string | null;
  deliveryStatus?: string | null;
  deliveredAt?: string | null;
  deliveryError?: string | null;

  playlistDetected?: boolean;
  playlistedAt?: string | null;

  clickCount?: number;
  lastClickedAt?: string | null;

  openCount?: number;
  lastOpenedAt?: string | null;

  replyCount?: number;
  lastRepliedAt?: string | null;
  positiveReply?: boolean | null;
  negativeReply?: boolean | null;

  followUpSent?: boolean;
  followUpSentAt?: string | null;

  track?: {
    id: string;
    title: string;
    spotifyTrackId?: string | null;
  };

  playlist?: Playlist | null;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}

function TrackingCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/35">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-white">
        {value}
      </p>

      {detail ? (
        <p className="mt-1 text-xs text-white/35">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

export default function PitchEditorPage() {
  const params = useParams();
  const pitchId = params?.id as string;

  const { getToken } = useAuth();

  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [channel, setChannel] =
    useState<"EMAIL" | "INAPP">("EMAIL");

  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function authHeaders() {
    const token = await getToken();

    if (!token) {
      throw new Error("Could not get authentication token.");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const headers = await authHeaders();

      const response = await fetch(`${API}/pitches/${pitchId}`, {
        headers,
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `HTTP ${response.status}`,
        );
      }

      const nextPitch = data.pitch as Pitch;

      setPitch(nextPitch);
      setSubject(nextPitch.subject || "");
      setBody(nextPitch.body || "");
      setChannel(
        nextPitch.channel === "INAPP" ? "INAPP" : "EMAIL",
      );
    } catch (err: any) {
      setError(err?.message || "Failed loading pitch");
    } finally {
      setLoading(false);
    }
  }

  async function generateAi() {
    try {
      setAiLoading(true);
      setError(null);

      if (!pitch?.matchId) {
        throw new Error("Missing matchId");
      }

      const headers = await authHeaders();

      const response = await fetch(
        `${API}/ai/generate-and-save-pitch`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            matchId: pitch.matchId,
            channel,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `HTTP ${response.status}`,
        );
      }

      if (data.pitch) {
        setSubject(data.pitch.subject || "");
        setBody(data.pitch.body || "");

        setPitch((current) =>
          current
            ? {
                ...current,
                ...data.pitch,
                track: current.track,
                playlist: current.playlist,
              }
            : data.pitch,
        );
      }
    } catch (err: any) {
      setError(err?.message || "AI generation failed");
    } finally {
      setAiLoading(false);
    }
  }

  async function sendEmail() {
    try {
      setEmailLoading(true);
      setError(null);

      const headers = await authHeaders();

      const response = await fetch(
        `${API}/pitches/${pitchId}/email`,
        {
          method: "POST",
          headers,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `HTTP ${response.status}`,
        );
      }

      await load();
    } catch (err: any) {
      setError(err?.message || "Send email failed");
    } finally {
      setEmailLoading(false);
    }
  }

  useEffect(() => {
    if (pitchId) {
      void load();
    }
  }, [pitchId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-white/10 bg-[#090b0b] p-8">
            <img
              src="/brand/logo.svg"
              alt="TuneReach"
              className="h-9 w-auto"
            />
            <p className="mt-8 text-sm text-white/45">
              Loading pitch workspace...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!pitch) {
    return (
      <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-white/10 bg-[#090b0b] p-8">
            <Link href="/dashboard" className="inline-flex">
              <img
                src="/brand/logo.svg"
                alt="TuneReach"
                className="h-9 w-auto"
              />
            </Link>

            <h1 className="mt-8 text-3xl font-black">
              Pitch not found
            </h1>

            {error ? (
              <p className="mt-3 text-sm text-red-300">
                {error}
              </p>
            ) : null}

            <Link
              href="/pitches"
              className="mt-6 inline-flex text-sm font-bold text-emerald-300 hover:text-emerald-200"
            >
              ← Back to Pitches
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const locked = pitch.status !== "DRAFT";
  const curator = pitch.playlist?.curator;

  const spotifyUrl =
    pitch.playlist?.spotifyUrl ||
    (pitch.playlist?.spotifyPlaylistId
      ? `https://open.spotify.com/playlist/${pitch.playlist.spotifyPlaylistId}`
      : null);

  const replyStatus =
    pitch.positiveReply === true
      ? "Interested"
      : pitch.negativeReply === true
        ? "Declined"
        : "No reply status";

  const playlistStatus = pitch.playlistDetected
    ? "Playlisted"
    : "Not detected";

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
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
                Pitch Workspace
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  {pitch.track?.title || "Untitled track"}
                </h1>

                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase text-emerald-300">
                  {pitch.status}
                </span>
              </div>

              <p className="mt-3 max-w-3xl text-sm text-white/50">
                {pitch.playlist?.name || "Unknown playlist"}
                {curator?.name
                  ? ` • Curator: ${curator.name}`
                  : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/pitches"
                className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-bold text-white/70 transition hover:bg-white/[0.07] hover:text-white"
              >
                ← Pitches
              </Link>

              {spotifyUrl ? (
                <a
                  href={spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-black text-emerald-300 transition hover:bg-emerald-400/15"
                >
                  Open Playlist ↗
                </a>
              ) : null}
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
          <section className="rounded-2xl border border-white/10 bg-[#090b0b] p-5 sm:p-6">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                  {pitch.status === "DRAFT"
                    ? "Pitch Draft"
                    : "Sent Pitch"}
                </p>

                <h2 className="mt-2 text-xl font-black">
                  Message
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded-xl border border-white/10 bg-black px-3 py-2.5 text-sm font-bold text-white outline-none disabled:cursor-not-allowed disabled:opacity-40"
                  value={channel}
                  onChange={(event) =>
                    setChannel(
                      event.target.value as
                        | "EMAIL"
                        | "INAPP",
                    )
                  }
                  disabled={locked}
                >
                  <option value="EMAIL">EMAIL</option>
                  <option value="INAPP">INAPP</option>
                </select>

                <button
                  onClick={generateAi}
                  disabled={aiLoading || locked}
                  className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-black text-emerald-300 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {aiLoading
                    ? "Generating..."
                    : pitch.subject || pitch.body
                      ? "Generate Again"
                      : "Generate AI Pitch"}
                </button>

                {pitch.status === "DRAFT" ? (
                  <button
                    onClick={sendEmail}
                    disabled={emailLoading}
                    className="rounded-xl bg-emerald-300 px-4 py-2.5 text-sm font-black text-black transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {emailLoading
                      ? "Sending..."
                      : "Send Email"}
                  </button>
                ) : (
                  <span className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5 text-sm font-black text-emerald-300">
                    ✓ {pitch.status}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/35">
                Subject
              </p>

              <div className="mt-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-bold text-white">
                {subject || "No subject"}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/35">
                Pitch
              </p>

              <div className="mt-2 min-h-[260px] whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-5 text-[15px] leading-7 text-white/75">
                {body || "No pitch body generated yet."}
              </div>
            </div>

            {locked ? (
              <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-xs text-white/40">
                This pitch is locked because its status is{" "}
                <span className="font-black text-white/65">
                  {pitch.status}
                </span>
                .
              </div>
            ) : null}
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-[#090b0b] p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                Pitch Status & Tracking
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <TrackingCard
                  label="Opens"
                  value={pitch.openCount ?? 0}
                  detail={
                    pitch.lastOpenedAt
                      ? formatDate(pitch.lastOpenedAt)
                      : "Not opened yet"
                  }
                />

                <TrackingCard
                  label="Clicks"
                  value={pitch.clickCount ?? 0}
                  detail={
                    pitch.lastClickedAt
                      ? formatDate(pitch.lastClickedAt)
                      : "No clicks yet"
                  }
                />

                <TrackingCard
                  label="Replies"
                  value={pitch.replyCount ?? 0}
                  detail={
                    pitch.lastRepliedAt
                      ? formatDate(pitch.lastRepliedAt)
                      : "No replies yet"
                  }
                />

                <TrackingCard
                  label="Placement"
                  value={pitch.playlistDetected ? "Yes" : "No"}
                  detail={playlistStatus}
                />
              </div>

              <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-white/40">
                    Reply status
                  </span>
                  <span
                    className={`text-sm font-black ${
                      pitch.positiveReply === true
                        ? "text-emerald-300"
                        : pitch.negativeReply === true
                          ? "text-red-300"
                          : "text-white/65"
                    }`}
                  >
                    {replyStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-white/40">
                    Delivery
                  </span>
                  <span className="text-sm font-black text-white/70">
                    {pitch.deliveryStatus ||
                      (pitch.sentAt ? "SENT" : "DRAFT")}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-white/40">
                    Follow-up
                  </span>
                  <span className="text-sm font-black text-white/70">
                    {pitch.followUpSent ? "Sent" : "Not sent"}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#090b0b] p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                Curator
              </p>

              <h2 className="mt-3 text-xl font-black">
                {curator?.name || "Unknown curator"}
              </h2>

              <p className="mt-1 break-all text-sm text-white/45">
                {curator?.email ||
                  pitch.sentTo ||
                  "No email available"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {curator?.websiteUrl ? (
                  <a
                    href={curator.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white/60 hover:bg-white/[0.05] hover:text-white"
                  >
                    Website ↗
                  </a>
                ) : null}

                {curator?.submissionUrl ? (
                  <a
                    href={curator.submissionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white/60 hover:bg-white/[0.05] hover:text-white"
                  >
                    Submission ↗
                  </a>
                ) : null}

                {curator?.instagramUrl ? (
                  <a
                    href={curator.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white/60 hover:bg-white/[0.05] hover:text-white"
                  >
                    Instagram ↗
                  </a>
                ) : null}
              </div>
            </section>
          </aside>
        </div>

        <section className="rounded-2xl border border-white/10 bg-[#090b0b] p-5 sm:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
              Activity
            </p>

            <h2 className="mt-2 text-xl font-black">
              Pitch History
            </h2>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-xs text-white/35">
                Created
              </p>
              <p className="mt-2 text-sm font-bold text-white/75">
                {formatDate(pitch.createdAt)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-xs text-white/35">
                Sent
              </p>
              <p className="mt-2 text-sm font-bold text-white/75">
                {formatDate(pitch.sentAt)}
              </p>
              {pitch.sentTo ? (
                <p className="mt-1 break-all text-xs text-white/35">
                  {pitch.sentTo}
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-xs text-white/35">
                Delivered
              </p>
              <p className="mt-2 text-sm font-bold text-white/75">
                {formatDate(pitch.deliveredAt)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <p className="text-xs text-white/35">
                Playlisted
              </p>
              <p className="mt-2 text-sm font-bold text-white/75">
                {formatDate(pitch.playlistedAt)}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
