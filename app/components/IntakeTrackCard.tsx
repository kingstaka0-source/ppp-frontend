"use client";

import { useMatchJob } from "./useMatchJob";
import { useEffect, useMemo, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

type Props = {
  artistId: string;
  onDone?: () => Promise<void> | void;
};

function prettyJson(x: any) {
  try {
    return JSON.stringify(x, null, 2);
  } catch {
    return String(x);
  }
}

export default function IntakeTrackCard({ artistId, onDone }: Props) {
  const [spotifyUrl, setSpotifyUrl] = useState(
    "https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6"
  );
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
      if (!artistId) {
        throw new Error("Missing artistId.");
      }

      const res = await fetch(`${API}/intake/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId,
          spotifyTrackUrl: spotifyUrl,
        }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

      const data = JSON.parse(text);

    if (data?.gated) {
  setSubmitErr(`Auto-match is gated: ${data.gated}. Upgrade/TRIAL/PRO nodig.`);
  onDone?.();
  return;
}

      const newJobId = data?.matchJob?.jobId ?? null;
      if (!newJobId) {
        setSubmitErr("No match job returned. Check the intake response.");
        return;
      }

      setJobId(newJobId);
    } catch (e: any) {
      setSubmitErr(e?.message ?? "Intake failed");
    } finally {
      setSubmitting(false);
    }
  }

  const didNotifyRef = useRef(false);

  useEffect(() => {
    if (!jobId) return;

    if (status === "QUEUED" || status === "RUNNING") {
      didNotifyRef.current = false;
    }

    if (status === "SUCCEEDED" && !didNotifyRef.current) {
      didNotifyRef.current = true;
      onDone?.();
    }
  }, [jobId, status, onDone]);

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl md:p-7">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
          Track Intake
        </p>
        <h2 className="text-2xl font-black tracking-tight text-white">
          Add a Track
        </h2>
        <p className="text-sm text-white/45">
          Paste a Spotify track URL to import your music and start playlist matching.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:p-5">
        <label className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">
          Spotify Track URL
        </label>

        <div className="mt-3 flex flex-col gap-3 lg:flex-row">
          <input
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/10"
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            placeholder="https://open.spotify.com/track/..."
          />

          <button
            onClick={submit}
            disabled={submitting}
            className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit & start matching"}
          </button>
        </div>
      </div>

      {submitErr && (
        <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300 whitespace-pre-wrap">
          {submitErr}
        </div>
      )}

      {jobId && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-400">
                Matching
              </p>
              <h3 className="mt-1 font-black text-white">Match Job</h3>
            </div>

            <span className="w-fit rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-bold text-white/60">
              {status}
              {polling ? " · polling..." : ""}
            </span>
          </div>

          <div className="mt-3 break-all font-mono text-[11px] text-white/25">
            jobId: {jobId}
          </div>

          {pollErr && (
            <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300 whitespace-pre-wrap">
              {pollErr}
            </div>
          )}

          {job?.status === "FAILED" && (
            <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300 whitespace-pre-wrap">
              FAILED: {job?.lastError || "Unknown error"}
            </div>
          )}

          {job?.status === "SUCCEEDED" && (
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-3 text-sm font-bold text-emerald-300">
                Matching complete
              </div>

              {top.length > 0 ? (
                <div>
                  <div className="text-sm font-black text-white">Top matches</div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {top.map((m: any) => (
                      <div
                        key={m.matchId}
                        className="rounded-xl border border-white/10 bg-black/20 p-4"
                      >
                        <div className="font-bold text-white">
                          {m.playlistName ?? m.playlistId}
                        </div>
                        <div className="mt-2 text-sm text-white/50">
                          Match score{" "}
                          <span className="font-bold text-emerald-300">
                            {m.fitScore}
                          </span>
                        </div>
                        <div className="mt-1 break-all font-mono text-[10px] text-white/25">
                          matchId: {m.matchId}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-white/45">
                  No matches in result.top
                </div>
              )}

              <details className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-white/50">
                <summary className="cursor-pointer font-bold text-white/70">
                  Raw result
                </summary>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] text-white/40">
                  {prettyJson(job?.result)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
