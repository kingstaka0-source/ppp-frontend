"use client";

import { useEffect, useRef, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

export type MatchJobStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";

export type MatchJob = {
  id: string;
  status: MatchJobStatus;
  trackId: string;
  artistId: string;
  attempts: number;
  maxAttempts: number;
  lastError: string | null;
  result: any | null;
  createdAt: string;
  updatedAt: string;
};

export function useMatchJob(jobId: string | null, opts?: { intervalMs?: number; timeoutMs?: number }) {
  const intervalMs = opts?.intervalMs ?? 1200;
  const timeoutMs = opts?.timeoutMs ?? 60_000;

  const [job, setJob] = useState<MatchJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      setLoading(false);
      setError(null);
      startedAtRef.current = null;
      return;
    }

    let timer: any = null;
    let cancelled = false;

    async function tick() {
      if (cancelled) return;

      if (startedAtRef.current == null) startedAtRef.current = Date.now();
      const elapsed = Date.now() - startedAtRef.current;

      if (elapsed > timeoutMs) {
        setError("Timeout: match job duurde te lang. Probeer refresh.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API}/match-jobs/${jobId}`, { cache: "no-store" });
        const text = await res.text();
        if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

        const data = JSON.parse(text);
        const nextJob = (data?.job ?? null) as MatchJob | null;
        setJob(nextJob);

        const st = nextJob?.status;
        if (st === "SUCCEEDED" || st === "FAILED") {
          setLoading(false);
          return; // stop polling
        }
      } catch (e: any) {
        setError(e?.message ?? "Failed to fetch job");
        setLoading(false);
        return; // stop polling bij error (kan ook doorpollen als je wil)
      }

      timer = setTimeout(tick, intervalMs);
    }

    tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [jobId, intervalMs, timeoutMs]);

  return { job, loading, error };
}
