import PlaylistMatchPitchButton from "./PlaylistMatchPitchButton";
import AutoPitchAllButton from "./AutoPitchAllButton";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

type PlaylistDetail = {
  id?: string | null;
  name?: string | null;
  spotifyPlaylistId?: string | null;
  genres?: string[] | null;
  minBpm?: number | null;
  maxBpm?: number | null;
  minEnergy?: number | null;
  maxEnergy?: number | null;
  rules?: unknown;
  createdAt?: string | null;
  matchCount?: number | null;
  tasteEventCount?: number | null;
  curator?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    contactMethod?: "EMAIL" | "INAPP" | null;
    consent?: boolean | null;
    languages?: string[] | null;
    canEmail?: boolean | null;
  } | null;
  tasteEvents?: {
    id?: string | null;
    spotifyTrackId?: string | null;
    label?: string | null;
    createdAt?: string | null;
  }[] | null;
  matches?: {
    id?: string | null;
    fitScore?: number | null;
    explanation?: string | null;
    createdAt?: string | null;
    track?: {
      id?: string | null;
      title?: string | null;
      spotifyTrackId?: string | null;
      artists?: string[] | null;
    } | null;
    pitch?: {
      id?: string | null;
      status?: string | null;
      channel?: string | null;
      sentAt?: string | null;
      sentTo?: string | null;
    } | null;
  }[] | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

function formatJson(value: unknown) {
  if (value == null) return "—";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "—";
  }
}

function safeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

async function getPlaylist(id: string): Promise<PlaylistDetail | null> {
  const res = await fetch(`${API}/playlists/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load playlist (${res.status}) ${text}`);
  }

  const json = await res.json().catch(() => ({}));
  return json?.playlist ?? null;
}

export default async function AdminPlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let playlist: PlaylistDetail | null = null;
  let loadError = "";

  try {
    playlist = await getPlaylist(id);
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load playlist.";
  }

  if (loadError) {
    return (
      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Playlist Detail</h1>
            <p className="text-sm text-gray-600">
              Could not load this playlist.
            </p>
          </div>

          <a
            href="/admin/playlists"
            className="px-4 py-2 rounded border border-black"
          >
            ← Back to Playlists
          </a>
        </div>

        <div className="border rounded p-4 bg-red-50 text-sm text-red-700">
          <strong>Could not load playlist.</strong>
          <div className="mt-1">{loadError}</div>
        </div>
      </main>
    );
  }

  if (!playlist) {
    return (
      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Playlist Detail</h1>
            <p className="text-sm text-gray-600">Playlist not found.</p>
          </div>

          <a
            href="/admin/playlists"
            className="px-4 py-2 rounded border border-black"
          >
            ← Back to Playlists
          </a>
        </div>

        <div className="border rounded p-4 text-sm text-gray-500">
          No playlist data was returned.
        </div>
      </main>
    );
  }

  const playlistId = playlist.id ?? id;
  const playlistName = playlist.name?.trim() || "Untitled playlist";
  const spotifyPlaylistId = playlist.spotifyPlaylistId || "—";
  const genres =
    playlist.genres && playlist.genres.length > 0
      ? playlist.genres.join(", ")
      : "—";
  const minBpm = playlist.minBpm ?? "—";
  const maxBpm = playlist.maxBpm ?? "—";
  const minEnergy = playlist.minEnergy ?? "—";
  const maxEnergy = playlist.maxEnergy ?? "—";
  const matchCount = safeNumber(playlist.matchCount);
  const tasteEventCount = safeNumber(playlist.tasteEventCount);
  const createdAt = formatDate(playlist.createdAt);
  const matches = Array.isArray(playlist.matches) ? playlist.matches : [];
  const tasteEvents = Array.isArray(playlist.tasteEvents)
    ? playlist.tasteEvents
    : [];

  const curatorName = playlist.curator?.name || "—";
  const curatorEmail = playlist.curator?.email || "—";
  const curatorContactMethod = playlist.curator?.contactMethod || "—";
  const curatorConsent =
    playlist.curator?.consent === true
      ? "Yes"
      : playlist.curator?.consent === false
      ? "No"
      : "—";
  const curatorCanEmail =
    playlist.curator?.canEmail === true
      ? "Yes"
      : playlist.curator?.canEmail === false
      ? "No"
      : "—";
  const curatorLanguages =
    playlist.curator?.languages && playlist.curator.languages.length > 0
      ? playlist.curator.languages.join(", ")
      : "—";

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{playlistName}</h1>
          <p className="text-sm text-gray-600">
            Spotify ID: {spotifyPlaylistId}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <a
            href="/admin/playlists"
            className="px-4 py-2 rounded border border-black"
          >
            ← Back to Playlists
          </a>

          <a
            href={`/admin/playlists/${playlistId}`}
            className="px-4 py-2 rounded border border-black"
          >
            Refresh
          </a>
        </div>
      </div>

      {playlist.id ? <AutoPitchAllButton playlistId={playlist.id} /> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="border rounded p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Matches
          </div>
          <div className="mt-1 text-2xl font-bold">{matchCount}</div>
        </div>

        <div className="border rounded p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Taste Events
          </div>
          <div className="mt-1 text-2xl font-bold">{tasteEventCount}</div>
        </div>

        <div className="border rounded p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Can Email
          </div>
          <div className="mt-1 text-2xl font-bold">{curatorCanEmail}</div>
        </div>

        <div className="border rounded p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Created
          </div>
          <div className="mt-1 text-base font-bold break-words">{createdAt}</div>
        </div>
      </div>

      <section className="border rounded p-4 space-y-2">
        <h2 className="text-lg font-semibold">Playlist Info</h2>

        <p>
          <strong>Genres:</strong> {genres}
        </p>
        <p>
          <strong>BPM:</strong> {minBpm} - {maxBpm}
        </p>
        <p>
          <strong>Energy:</strong> {minEnergy} - {maxEnergy}
        </p>
        <p>
          <strong>Matches:</strong> {matchCount}
        </p>
        <p>
          <strong>Taste events:</strong> {tasteEventCount}
        </p>
        <p>
          <strong>Created:</strong> {createdAt}
        </p>

        <div>
          <strong>Rules:</strong>
          <pre className="mt-2 p-3 rounded bg-gray-100 overflow-x-auto whitespace-pre-wrap text-xs">
            {formatJson(playlist.rules)}
          </pre>
        </div>
      </section>

      <section className="border rounded p-4 space-y-2">
        <h2 className="text-lg font-semibold">Curator</h2>

        <p>
          <strong>Name:</strong> {curatorName}
        </p>
        <p>
          <strong>Email:</strong> {curatorEmail}
        </p>
        <p>
          <strong>Contact method:</strong> {curatorContactMethod}
        </p>
        <p>
          <strong>Consent:</strong> {curatorConsent}
        </p>
        <p>
          <strong>Can Email:</strong> {curatorCanEmail}
        </p>
        <p>
          <strong>Languages:</strong> {curatorLanguages}
        </p>
      </section>

      <section className="border rounded p-4 space-y-3">
        <h2 className="text-lg font-semibold">Matches</h2>

        {matches.length === 0 ? (
          <p className="text-sm text-gray-500">No matches yet.</p>
        ) : (
          <div className="space-y-4">
            {matches.map((match, index) => {
              const matchId = match.id ?? `match-${index}`;
              const trackTitle = match.track?.title || "—";
              const trackArtists =
                match.track?.artists && match.track.artists.length > 0
                  ? match.track.artists.join(", ")
                  : "—";
              const fitScore =
                typeof match.fitScore === "number" ? match.fitScore : "—";
              const explanation = match.explanation || "—";
              const pitchStatus = match.pitch?.status || "—";
              const pitchChannel = match.pitch?.channel || "—";
              const pitchSentTo = match.pitch?.sentTo || "—";

              return (
                <div key={matchId} className="border rounded p-3 space-y-3">
                  <p>
                    <strong>Track:</strong> {trackTitle}
                  </p>
                  <p>
                    <strong>Artists:</strong> {trackArtists}
                  </p>
                  <p>
                    <strong>Fit Score:</strong> {fitScore}
                  </p>
                  <p>
                    <strong>Explanation:</strong> {explanation}
                  </p>

                  <div className="flex gap-2 flex-wrap">
                    {match.track?.id ? (
                      <a
                        href={`/tracks/${match.track.id}`}
                        className="px-3 py-2 rounded border border-black"
                      >
                        Open Track
                      </a>
                    ) : null}

                    {match.id ? (
                      <PlaylistMatchPitchButton
                        matchId={match.id}
                        pitchId={match.pitch?.id || null}
                      />
                    ) : null}
                  </div>

                  <div className="text-sm">
                    <strong>Pitch:</strong>
                    {match.pitch ? (
                      <div className="mt-1 space-y-1">
                        <p>Status: {pitchStatus}</p>
                        <p>Channel: {pitchChannel}</p>
                        <p>Sent To: {pitchSentTo}</p>
                      </div>
                    ) : (
                      <p className="mt-1 text-gray-500">No pitch yet.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="border rounded p-4 space-y-3">
        <h2 className="text-lg font-semibold">Taste Events</h2>

        {tasteEvents.length === 0 ? (
          <p className="text-sm text-gray-500">No taste events yet.</p>
        ) : (
          <div className="space-y-2">
            {tasteEvents.map((event, index) => {
              const eventId = event.id ?? `taste-event-${index}`;
              const label = event.label || "—";
              const spotifyTrackId = event.spotifyTrackId || "—";
              const eventDate = formatDate(event.createdAt);

              return (
                <div key={eventId} className="border rounded p-3 text-sm">
                  <p>
                    <strong>Label:</strong> {label}
                  </p>
                  <p>
                    <strong>Spotify Track ID:</strong> {spotifyTrackId}
                  </p>
                  <p>
                    <strong>Date:</strong> {eventDate}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}