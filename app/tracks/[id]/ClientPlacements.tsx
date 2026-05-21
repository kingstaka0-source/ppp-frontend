"use client";

import { useState } from "react";
import FoundPlaylists from "./FoundPlaylists";

type Placement = {
  id: string;
  name: string;
  followers: number;
  spotifyUrl: string | null;
};

export default function ClientPlacements({
  initialPlacements,
  trackId,
  artistId,
}: {
  initialPlacements: Placement[];
  trackId: string;
  artistId: string;
}) {
  const [placements, setPlacements] =
    useState<Placement[]>(initialPlacements);

  const [loading, setLoading] = useState(false);

  
  async function refreshPlacements() {
    try {
      setLoading(true);

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tracks/${trackId}/check-placements`,
        {
          method: "POST",
          headers: {
            "x-artist-id": artistId,
          },
        }
      );

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tracks/${trackId}/placements`,
        {
          headers: {
            "x-artist-id": artistId,
          },
          cache: "no-store",
        }
      );

      const data = await res.json();

      setPlacements(data);
    } catch (err) {
      console.error(err);
    } finally {
  setLoading(false);
}
  }

  return (
    <div className="space-y-4">
      <button
        onClick={refreshPlacements}
        disabled={loading}
        className="rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-3 text-white font-semibold disabled:opacity-50"
      >
        {loading
          ? "Checking placements..."
          : "Check Playlist Placements"}
      </button>

      <FoundPlaylists placements={placements} />
    </div>
  );
}