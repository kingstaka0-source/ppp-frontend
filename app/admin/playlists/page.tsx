import ImportPlaylistForm from "./ImportPlaylistForm";
import BulkImportPlaylistsForm from "./BulkImportPlaylistsForm";
import SpotifyPlaylistSearchForm from "./SpotifyPlaylistSearchForm";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

type Playlist = {
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

async function getPlaylists(): Promise<Playlist[]> {
  const res = await fetch(`${API}/playlists`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load playlists (${res.status}) ${text}`);
  }

  const json = await res.json().catch(() => ({}));

  if (Array.isArray(json?.playlists)) return json.playlists;
  if (Array.isArray(json)) return json;

  return [];
}

export default async function AdminPlaylistsPage() {
  let playlists: Playlist[] = [];
  let loadError = "";

  try {
    playlists = await getPlaylists();
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load playlists.";
  }

  const totalCount = playlists.length;
  const totalMatches = playlists.reduce(
    (sum, playlist) => sum + safeNumber(playlist.matchCount),
    0
  );
  const totalTasteEvents = playlists.reduce(
    (sum, playlist) => sum + safeNumber(playlist.tasteEventCount),
    0
  );
  const emailableCount = playlists.filter(
    (playlist) => playlist.curator?.canEmail === true
  ).length;

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Playlists</h1>
          <p className="text-sm text-gray-600">
            Review imported playlists, curator data, and match totals.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <a href="/admin" className="px-4 py-2 rounded border border-black">
            ← Back to Admin
          </a>
          <a
            href="/admin/playlists"
            className="px-4 py-2 rounded border border-black"
          >
            Refresh
          </a>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="border rounded p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Total
          </div>
          <div className="mt-1 text-2xl font-bold">{totalCount}</div>
        </div>

        <div className="border rounded p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Total Matches
          </div>
          <div className="mt-1 text-2xl font-bold">{totalMatches}</div>
        </div>

        <div className="border rounded p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Taste Events
          </div>
          <div className="mt-1 text-2xl font-bold">{totalTasteEvents}</div>
        </div>

        <div className="border rounded p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Emailable Curators
          </div>
          <div className="mt-1 text-2xl font-bold">{emailableCount}</div>
        </div>
      </div>

      <SpotifyPlaylistSearchForm />
      <ImportPlaylistForm />
      <BulkImportPlaylistsForm />

      {loadError ? (
        <div className="border rounded p-4 bg-red-50 text-sm text-red-700">
          <strong>Could not load playlists.</strong>
          <div className="mt-1">{loadError}</div>
        </div>
      ) : null}

      {!loadError && playlists.length === 0 ? (
        <div className="border rounded p-6 text-sm text-gray-500">
          No playlists found yet.
        </div>
      ) : null}

      {!loadError && playlists.length > 0 ? (
        <div className="grid gap-4">
          {playlists.map((playlist, index) => {
            const playlistId = playlist.id ?? `playlist-${index}`;
            const name = playlist.name?.trim() || "Untitled playlist";
            const spotifyId = playlist.spotifyPlaylistId || "—";
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
            const curatorName = playlist.curator?.name || "—";
            const curatorEmail = playlist.curator?.email || "—";
            const canEmail =
              playlist.curator?.canEmail === true
                ? "Yes"
                : playlist.curator?.canEmail === false
                ? "No"
                : "—";

            return (
              <div key={playlistId} className="border rounded p-4 space-y-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-lg font-semibold">{name}</h2>
                    <p className="text-sm text-gray-700">
                      <strong>Spotify ID:</strong> {spotifyId}
                    </p>
                  </div>

                  {playlist.id ? (
                    <a
                      href={`/admin/playlists/${playlist.id}`}
                      className="px-3 py-2 rounded bg-black text-white text-sm"
                    >
                      Open
                    </a>
                  ) : null}
                </div>

                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <p>
                      <strong>Genres:</strong> {genres}
                    </p>
                    <p>
                      <strong>BPM:</strong> {minBpm} - {maxBpm}
                    </p>
                    <p>
                      <strong>Energy:</strong> {minEnergy} - {maxEnergy}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p>
                      <strong>Matches:</strong> {matchCount}
                    </p>
                    <p>
                      <strong>Taste events:</strong> {tasteEventCount}
                    </p>
                    <p>
                      <strong>Created:</strong> {createdAt}
                    </p>
                  </div>
                </div>

                <div className="text-sm space-y-1">
                  <p>
                    <strong>Curator:</strong> {curatorName}
                  </p>
                  <p>
                    <strong>Email:</strong> {curatorEmail}
                  </p>
                  <p>
                    <strong>Can Email:</strong> {canEmail}
                  </p>
                </div>

                <div className="text-sm">
                  <strong>Rules:</strong>
                  <pre className="mt-2 p-3 rounded bg-gray-100 overflow-x-auto whitespace-pre-wrap text-xs">
                    {formatJson(playlist.rules)}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}