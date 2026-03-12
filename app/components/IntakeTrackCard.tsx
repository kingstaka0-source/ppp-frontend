"use client";

import { useMatchJob } from "./useMatchJob";
import { useEffect, useMemo, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

type Props = {
  onDone?: () => Promise<void> | void; // refresh parent
};

function prettyJson(x: any) {
  try {
    return JSON.stringify(x, null, 2);
  } catch {
    return String(x);
  }
}

export default function IntakeTrackCard({ onDone }: Props) {
  const [spotifyUrl, setSpotifyUrl] = useState("https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6");
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  const [jobId, setJobId] = useState<string | null>(null);

  const { job, loading: polling, error: pollErr } = useMatchJob(jobId);

  const status = job?.status ?? (jobId ? "QUEUED" : null);

  const top = useMemo(() => {
    const arr = job?.result?.top;
    return Array.isArray(arr) ? arr : [];
  }, [job?.result]);

  async function submit() {
    setSubmitErr(null);
    setSubmitting(true);
    setJobId(null);

    try {
      if (!ARTIST_ID) throw new Error("Missing NEXT_PUBLIC_ARTIST_ID (.env.local).");

      const res = await fetch(`${API}/intake/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: ARTIST_ID,
          spotifyTrackUrl: spotifyUrl,
        }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

      const data = JSON.parse(text);

      // gated? (free plan)
      if (data?.gated) {
        setSubmitErr(`Auto-match is gated: ${data.gated}. Upgrade/TRIAL/PRO nodig.`);
        return;
      }

      const newJobId = data?.matchJob?.jobId ?? null;
      if (!newJobId) {
        setSubmitErr("Geen matchJob terug. Check: plan gating of enqueueMatchJob.");
        return;
      }

      setJobId(newJobId);
    } catch (e: any) {
      setSubmitErr(e?.message ?? "Intake failed");
    } finally {
      setSubmitting(false);
    }
  }

  // Auto refresh wanneer SUCCEEDED
  const didNotifyRef = useRef(false);

useEffect(() => {
  if (!jobId) return; // nog geen job gestart

  // reset wanneer job opnieuw start / opnieuw submitted
  if (status === "QUEUED" || status === "RUNNING") {
    didNotifyRef.current = false;
  }

  // fire 1x wanneer job klaar is
  if (status === "SUCCEEDED" && !didNotifyRef.current) {
    didNotifyRef.current = true;
    // onDone?.();
  }
}, [jobId, status, onDone]);
  

  return (
    <div className="border rounded-xl p-6 space-y-4">
      <div className="text-xl font-bold">Intake Track</div>

      <div className="space-y-2">
        <label className="text-sm text-gray-600">Spotify track URL</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={spotifyUrl}
          onChange={(e) => setSpotifyUrl(e.target.value)}
          placeholder="https://open.spotify.com/track/..."
        />
      </div>

      <button
        onClick={submit}
        disabled={submitting}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit & start matching"}
      </button>

      {submitErr && <div className="text-red-600 whitespace-pre-wrap">{submitErr}</div>}

      {jobId && (
        <div className="border rounded-lg p-4 space-y-2 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Match job</div>
            <div className="text-xs text-gray-600">jobId: {jobId}</div>
          </div>

          <div className="text-sm">
            Status:{" "}
            <span className="font-mono">
              {status}
              {polling ? " (polling…)" : ""}
            </span>
          </div>

          {pollErr && <div className="text-red-600 text-sm whitespace-pre-wrap">{pollErr}</div>}

          {job?.status === "FAILED" && (
            <div className="text-red-700 text-sm whitespace-pre-wrap">
              FAILED: {job?.lastError || "Unknown error"}
            </div>
          )}

          {job?.status === "SUCCEEDED" && (
            <div className="space-y-2">
              <div className="text-green-700 text-sm font-semibold">✅ Matching klaar</div>

              {top.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm font-semibold">Top matches</div>
                  <div className="space-y-2">
                    {top.map((m: any) => (
                      <div key={m.matchId} className="border rounded p-3 bg-white">
                        <div className="font-semibold">{m.playlistName ?? m.playlistId}</div>
                        <div className="text-sm text-gray-700">Score: {m.fitScore}</div>
                        <div className="text-xs text-gray-500 font-mono">matchId: {m.matchId}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-700">Geen matches in result.top</div>
              )}

              <details className="text-xs">
                <summary className="cursor-pointer">Raw result</summary>
                <pre className="whitespace-pre-wrap">{prettyJson(job?.result)}</pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
