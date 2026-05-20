"use client";

export default function DetectPlaylistButton({
  trackId,
  artistId,
}: {
  trackId: string;
  artistId: string;
}) {
  async function handleClick() {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      const res = await fetch(
        `${API_URL}/detect-playlists/${trackId}`,
        {
          method: "POST",
          headers: {
            "x-artist-id": artistId,
          },
        }
      );

      const json = await res.json();

      console.log(json);

      alert("Playlist detection completed");
    } catch (err) {
      console.error(err);
      alert("Detection failed");
    }
  }

  return (
    <button
      onClick={handleClick}
      className="mt-4 rounded-xl bg-green-600 px-4 py-2 text-white"
    >
      Check Playlist Placements
    </button>
  );
}