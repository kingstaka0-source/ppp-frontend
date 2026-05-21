"use client";

type Placement = {
  id: string;
  name: string;
  followers?: number;
  spotifyUrl?: string | null;
};

export default function FoundPlaylists({
  placements,
}: {
  placements: Placement[];
}) {
  if (!Array.isArray(placements) || placements.length === 0) {
  return null;
}

  return (
    <div className="mt-8 rounded-2xl border p-4 bg-green-50">
      <h2 className="text-xl font-bold mb-4">
        Found In Playlists
      </h2>

      <div className="space-y-3">
        {placements.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border bg-white p-4"
          >
            <div className="font-semibold text-lg">
              🔥 {p.name}
            </div>

            {p.followers ? (
              <div className="text-sm text-gray-600 mt-1">
                👥 {p.followers.toLocaleString()} followers
              </div>
            ) : null}

            {p.spotifyUrl ? (
              <a
                href={p.spotifyUrl}
                target="_blank"
                className="inline-block mt-2 text-green-700 underline"
              >
                Open Spotify
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}