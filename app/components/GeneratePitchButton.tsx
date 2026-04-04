"use client";

import { useState } from "react";

type GeneratePitchButtonProps = {
  matchId: string;
  artistId: string;
  disabled?: boolean;
};

export default function GeneratePitchButton({
  matchId,
  artistId,
  disabled = false,
}: GeneratePitchButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  async function handleGenerate() {
    if (disabled || loading) return;

    try {
      setLoading(true);
      setMessage("");

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is missing");
      }

      const res = await fetch(`${baseUrl}/ai/generate-and-save-pitch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": artistId,
        },
        body: JSON.stringify({ matchId, artistId }),
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || "Failed to generate pitch");
      }

      setMessage("Pitch generated.");
      window.location.reload();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to generate pitch";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={disabled || loading}
        className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Pitch"}
      </button>

      {message ? (
        <p className="mt-2 text-xs text-gray-600">{message}</p>
      ) : null}
    </div>
  );
}