"use client";

import Link from "next/link";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

export default function SendAllPitchesButton({
  trackId,
  artistId,
  disabled = false,
  lockedReason,
}: {
  trackId: string;
  artistId: string;
  disabled?: boolean;
  lockedReason?: string;
}) {
  const [sendingDrafts, setSendingDrafts] = useState(false);
  const [autoSending, setAutoSending] = useState(false);
  const [message, setMessage] = useState("");

  async function callEndpoint(url: string, mode: "drafts" | "auto") {
    if (disabled) {
      setMessage(lockedReason || "Upgrade required");
      return;
    }

    if (!artistId) {
      setMessage("Missing artistId");
      return;
    }

    const confirmText =
      mode === "drafts"
        ? "Send all existing DRAFT pitches for this track now?\n\nThis will send emails using your current backend email configuration."
        : "Auto create/generate/send pitches for this track now?\n\nThis will send emails using your current backend email configuration.";

    const ok = window.confirm(confirmText);
    if (!ok) return;

    try {
      setMessage("");

      if (mode === "drafts") setSendingDrafts(true);
      if (mode === "auto") setAutoSending(true);

      const r = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": artistId,
        },
      });

      const j = await r.json().catch(() => ({}));

      if (!r.ok) {
        if (r.status === 403 && j?.upgradeRequired) {
          setMessage(j?.message || "Upgrade required");
          return;
        }

        throw new Error(j?.error || j?.message || "Request failed");
      }

      alert(
        `Done ✅\n\nTotal: ${j.total ?? j.totalDraftsFound ?? 0}\nSent: ${j.sentCount ?? j.sent ?? 0}\nFailed: ${j.failedCount ?? j.failed ?? 0}`
      );

      window.location.reload();
    } catch (e: any) {
      setMessage(e?.message || "Request failed");
    } finally {
      setSendingDrafts(false);
      setAutoSending(false);
    }
  }

  const isBusy = sendingDrafts || autoSending;

  return (
    <div className="space-y-2">
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => callEndpoint(`${API}/tracks/${trackId}/send-all`, "drafts")}
          disabled={disabled || isBusy}
          className={`px-4 py-2 rounded transition ${
            disabled || isBusy
              ? "cursor-not-allowed bg-gray-200 text-gray-500"
              : "bg-green-600 text-white"
          }`}
        >
          {sendingDrafts ? "Sending..." : "Send All Draft Pitches"}
        </button>

        <button
          onClick={() =>
            callEndpoint(`${API}/tracks/${trackId}/auto-pitch-send`, "auto")
          }
          disabled={disabled || isBusy}
          className={`px-4 py-2 rounded transition ${
            disabled || isBusy
              ? "cursor-not-allowed bg-gray-200 text-gray-500"
              : "bg-blue-600 text-white"
          }`}
        >
          {autoSending ? "Auto Sending..." : "Auto Pitch + Send"}
        </button>
      </div>

      {disabled && lockedReason ? (
        <div className="text-xs text-amber-700">
          {lockedReason}{" "}
          <Link
            href={`/upgrade?artistId=${encodeURIComponent(artistId)}`}
            className="underline"
          >
            Upgrade
          </Link>
        </div>
      ) : null}

      {message ? (
        <div className="text-xs text-gray-700">
          {message.toLowerCase().includes("upgrade") ? (
            <>
              {message}{" "}
              <Link
                href={`/upgrade?artistId=${encodeURIComponent(artistId)}`}
                className="underline"
              >
                Upgrade
              </Link>
            </>
          ) : (
            message
          )}
        </div>
      ) : null}
    </div>
  );
}