// app/pitches/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

type Pitch = {
  id: string;
  matchId: string;
  subject: string;
  body: string;
  channel: "EMAIL" | "INAPP";
  status: "DRAFT" | "QUEUED" | "SENT";
  sentAt?: string | null;
  sentTo?: string | null;

  track?: {
    id: string;
    title: string;
    spotifyTrackId?: string | null;
  };

  playlist?: {
    id: string;
    name: string;
  };
};

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

      const r = await fetch(`${API}/pitches/${pitchId}`, {
        headers,
        cache: "no-store",
      });

      const j = await r.json();

      if (!r.ok) {
        throw new Error(
          j?.message || j?.error || `HTTP ${r.status}`,
        );
      }

      const p = j.pitch as Pitch;

      setPitch(p);
      setSubject(p.subject || "");
      setBody(p.body || "");
      setChannel(
        p.channel === "INAPP" ? "INAPP" : "EMAIL",
      );
    } catch (e: any) {
      setError(e?.message || "Failed loading pitch");
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

      const r = await fetch(
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

      const j = await r.json();

      if (!r.ok) {
        throw new Error(
          j?.message || j?.error || `HTTP ${r.status}`,
        );
      }

      if (j.pitch) {
        setSubject(j.pitch.subject || "");
        setBody(j.pitch.body || "");
        setPitch((current) =>
          current
            ? {
                ...current,
                ...j.pitch,
                track: current.track,
                playlist: current.playlist,
              }
            : j.pitch,
        );
      }
    } catch (e: any) {
      setError(e?.message || "AI generation failed");
    } finally {
      setAiLoading(false);
    }
  }

  async function sendEmail() {
    try {
      setEmailLoading(true);
      setError(null);

      const headers = await authHeaders();

      const r = await fetch(
        `${API}/pitches/${pitchId}/email`,
        {
          method: "POST",
          headers,
        },
      );

      const j = await r.json();

      if (!r.ok) {
        throw new Error(
          j?.message || j?.error || `HTTP ${r.status}`,
        );
      }

      await load();
    } catch (e: any) {
      setError(e?.message || "Send email failed");
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
    return <div className="p-10">Loading...</div>;
  }

  if (!pitch) {
    return (
      <div className="p-10">
        Pitch not found
        <br />
        <Link href="/dashboard">Back</Link>
      </div>
    );
  }

  const locked = pitch.status !== "DRAFT";

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">
        Pitch Editor
      </h1>

      <div className="text-sm text-gray-600">
        Track: <b>{pitch.track?.title || "—"}</b>{" "}
        • Playlist:{" "}
        <b>{pitch.playlist?.name || "—"}</b>{" "}
        • Status: <b>{pitch.status}</b>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="border rounded-xl p-6 space-y-4">
        <div className="flex gap-2 flex-wrap">
          <select
            className="border rounded p-2"
            value={channel}
            onChange={(e) =>
              setChannel(
                e.target.value as "EMAIL" | "INAPP",
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
            className="bg-black text-white px-4 py-2 rounded"
          >
            {aiLoading
              ? "Generating..."
              : "Generate AI"}
          </button>

          <button
            onClick={sendEmail}
            disabled={emailLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {emailLoading
              ? "Sending..."
              : "Send Email"}
          </button>
        </div>

        <input
          className="w-full border p-2 rounded"
          value={subject}
          readOnly
        />

        <textarea
          className="w-full border p-2 rounded min-h-[240px]"
          value={body}
          readOnly
        />

        {locked && (
          <div className="text-xs text-gray-500">
            Locked because pitch is{" "}
            <b>{pitch.status}</b>
          </div>
        )}
      </div>

      <Link href="/dashboard" className="underline">
        ← Back
      </Link>
    </div>
  );
}