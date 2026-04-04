"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  trackId: string;
  artistId: string;
  disabled?: boolean;
};

export default function LaunchCampaignButton({
  trackId,
  artistId,
  disabled = false,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLaunch() {
    if (disabled || loading) return;

    try {
      setLoading(true);
      setMessage("");

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) throw new Error("API URL missing");

      const res = await fetch(`${baseUrl}/pitches/launch-campaign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": artistId,
        },
        body: JSON.stringify({ trackId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to launch campaign");
      }

      setMessage(
        `Campaign done: ${data.created} created, ${data.skippedExisting} skipped`
      );

      router.refresh();
    } catch (err: any) {
      setMessage(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-4">
      <button
        onClick={handleLaunch}
        disabled={disabled || loading}
        className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Launching..." : "🚀 Launch Campaign"}
      </button>

      {message && (
        <p className="mt-2 text-xs text-gray-600">{message}</p>
      )}
    </div>
  );
}