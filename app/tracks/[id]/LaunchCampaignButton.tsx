"use client";

import { useState } from "react";

type Props = {
  trackId: string;
  artistId: string;
  disabled?: boolean;
};

export default function LaunchCampaignButton({
  trackId,
  artistId,
  disabled,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function launchCampaign() {
    try {
      setLoading(true);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const sendRes = await fetch(
        `${apiUrl}/tracks/${trackId}/auto-pitch-send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-artist-id": artistId,
          },
        }
      );

      const sendData = await sendRes.json();

      if (!sendRes.ok) {
        alert(sendData?.message || sendData?.error || "Campaign launch failed");
        return;
      }

      await fetch(`${apiUrl}/tracks/${trackId}/check-placements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": artistId,
        },
      });

      alert(
        `Campaign completed!\n\nSent: ${sendData.sentCount || 0}\nFailed: ${
          sendData.failedCount || 0
        }\nSkipped: ${sendData.skippedCount || 0}`
      );

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Campaign launch failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={launchCampaign}
      disabled={disabled || loading}
      className="rounded-xl bg-orange-600 hover:bg-orange-700 px-5 py-3 text-white font-semibold disabled:opacity-50"
    >
      {loading ? "Launching campaign..." : "🚀 Launch Campaign"}
    </button>
  );
}