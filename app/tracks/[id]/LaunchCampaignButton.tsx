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

  const [result, setResult] = useState<{
  sent: number;
  failed: number;
  skipped: number;
} | null>(null);

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

      setResult({
  sent: sendData.sentCount || 0,
  failed: sendData.failedCount || 0,
  skipped: sendData.skippedCount || 0,
});

      
    } catch (err) {
      console.error(err);
      alert("Campaign launch failed");
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="space-y-4">
    <button
      onClick={launchCampaign}
      disabled={disabled || loading}
      className="rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-3 text-white font-semibold shadow-md disabled:opacity-50"
    >
      {loading ? "Launching campaign..." : "Launch Campaign"}
    </button>

    {result && (
      <div className="rounded-2xl border border-green-300 bg-green-50 p-5">
        <h3 className="text-xl font-bold mb-3">
          Campaign Results
        </h3>

        <div className="space-y-2 text-sm">
          <div>
            ✅ Sent: <strong>{result.sent}</strong>
          </div>

          <div>
            ❌ Failed: <strong>{result.failed}</strong>
          </div>

          <div>
            ⏭️ Skipped: <strong>{result.skipped}</strong>
          </div>
        </div>
      </div>
    )}
  </div>
);
}