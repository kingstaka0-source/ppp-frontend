"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

type SendQueuedResult = {
  ok?: boolean;
  totalQueued?: number;
  sent?: number;
  failed?: number;
  message?: string;
  error?: string;
};

type ResetWrongQueuedResult = {
  ok?: boolean;
  totalQueued?: number;
  reset?: number;
  kept?: number;
  message?: string;
  error?: string;
};

function safeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export default function SendQueuedEmailsButton() {
  const router = useRouter();

  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [error, setError] = useState("");
  const [sendResult, setSendResult] = useState<SendQueuedResult | null>(null);
  const [resetResult, setResetResult] = useState<ResetWrongQueuedResult | null>(null);

  async function sendQueued() {
    if (!ARTIST_ID) {
      setError("Missing NEXT_PUBLIC_ARTIST_ID in .env.local");
      setSendResult(null);
      setResetResult(null);
      return;
    }

    setSending(true);
    setError("");
    setSendResult(null);
    setResetResult(null);

    try {
      const res = await fetch(`${API}/pitches/send-queued`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": ARTIST_ID,
        },
        body: JSON.stringify({}),
      });

      const data: SendQueuedResult = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || `Could not send queued emails (${res.status})`
        );
      }

      setSendResult({
        ok: data?.ok ?? true,
        totalQueued: safeNumber(data?.totalQueued),
        sent: safeNumber(data?.sent),
        failed: safeNumber(data?.failed),
      });

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not send queued emails."
      );
    } finally {
      setSending(false);
    }
  }

  async function resetWrongQueued() {
    if (!ARTIST_ID) {
      setError("Missing NEXT_PUBLIC_ARTIST_ID in .env.local");
      setSendResult(null);
      setResetResult(null);
      return;
    }

    setResetting(true);
    setError("");
    setSendResult(null);
    setResetResult(null);

    try {
      const res = await fetch(`${API}/pitches/reset-wrong-queued`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": ARTIST_ID,
        },
        body: JSON.stringify({}),
      });

      const data: ResetWrongQueuedResult = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Could not reset wrong queued pitches (${res.status})`
        );
      }

      setResetResult({
        ok: data?.ok ?? true,
        totalQueued: safeNumber(data?.totalQueued),
        reset: safeNumber(data?.reset),
        kept: safeNumber(data?.kept),
      });

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not reset wrong queued pitches."
      );
    } finally {
      setResetting(false);
    }
  }

  const isBusy = sending || resetting;
  const missingArtistId = !ARTIST_ID;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={sendQueued}
          disabled={isBusy || missingArtistId}
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sending ? "Sending..." : "Send Queued Emails"}
        </button>

        <button
          onClick={resetWrongQueued}
          disabled={isBusy || missingArtistId}
          className="px-4 py-2 rounded bg-orange-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {resetting ? "Resetting..." : "Reset Wrong Queued"}
        </button>
      </div>

      {missingArtistId ? (
        <div className="border rounded p-3 text-sm bg-yellow-50 text-yellow-900">
          Missing <strong>NEXT_PUBLIC_ARTIST_ID</strong> in <strong>.env.local</strong>.
        </div>
      ) : null}

      {sendResult ? (
        <div className="border rounded p-3 text-sm bg-green-50 text-green-900 space-y-1">
          <div>
            <strong>Send queued result</strong>
          </div>
          <div>OK: {sendResult.ok ? "true" : "false"}</div>
          <div>Total queued: {safeNumber(sendResult.totalQueued)}</div>
          <div>Sent: {safeNumber(sendResult.sent)}</div>
          <div>Failed: {safeNumber(sendResult.failed)}</div>
        </div>
      ) : null}

      {resetResult ? (
        <div className="border rounded p-3 text-sm bg-orange-50 text-orange-900 space-y-1">
          <div>
            <strong>Reset wrong queued result</strong>
          </div>
          <div>OK: {resetResult.ok ? "true" : "false"}</div>
          <div>Total queued: {safeNumber(resetResult.totalQueued)}</div>
          <div>Reset: {safeNumber(resetResult.reset)}</div>
          <div>Kept: {safeNumber(resetResult.kept)}</div>
        </div>
      ) : null}

      {error ? (
        <div className="border rounded p-3 text-sm bg-red-50 text-red-700">
          <strong>Action failed.</strong>
          <div className="mt-1">{error}</div>
        </div>
      ) : null}
    </div>
  );
}