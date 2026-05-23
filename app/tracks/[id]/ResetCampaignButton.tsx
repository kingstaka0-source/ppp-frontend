"use client";

import { useState } from "react";

type Props = {
  trackId: string;
  artistId: string;
};

export default function ResetCampaignButton({ trackId, artistId }: Props) {
  const [loading, setLoading] = useState(false);
  const [resetCount, setResetCount] = useState<number | null>(null);

  async function resetCampaign() {
    const confirmReset = window.confirm(
      "Reset campaign for this track? This will move existing pitches back to DRAFT so you can launch again."
    );

    if (!confirmReset) return;

    try {
      setLoading(true);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(`${apiUrl}/tracks/${trackId}/reset-campaign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": artistId,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || data?.error || "Reset campaign failed");
        return;
      }

      setResetCount(data.resetCount || 0);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Reset campaign failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={resetCampaign}
        disabled={loading}
        className="rounded-xl bg-gray-800 hover:bg-gray-900 px-5 py-3 text-white font-semibold shadow-md disabled:opacity-50"
      >
        {loading ? "Resetting..." : "Reset Campaign"}
      </button>

      {resetCount !== null ? (
        <p className="text-sm text-gray-600">
          Reset {resetCount} pitches back to draft.
        </p>
      ) : null}
    </div>
  );
}