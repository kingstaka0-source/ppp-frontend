import SendQueuedEmailsButton from "./SendQueuedEmailsButton";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

type PitchStatus = "DRAFT" | "QUEUED" | "SENT" | "FAILED";
type PitchChannel = "EMAIL" | "INAPP";

type PitchRow = {
  id?: string | null;
  subject?: string | null;
  body?: string | null;
  channel?: PitchChannel | null;
  status?: PitchStatus | null;
  sentAt?: string | null;
  sentTo?: string | null;
  createdAt?: string | null;
  track?: {
    id?: string | null;
    title?: string | null;
    spotifyTrackId?: string | null;
    artists?: string[] | null;
  } | null;
  playlist?: {
    id?: string | null;
    name?: string | null;
    spotifyPlaylistId?: string | null;
    genres?: string[] | null;
  } | null;
  curator?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    contactMethod?: string | null;
    consent?: boolean | null;
    canEmail?: boolean | null;
  } | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

async function getPitches(): Promise<PitchRow[]> {
  if (!ARTIST_ID) {
    return [];
  }

  const res = await fetch(`${API}/pitches`, {
    cache: "no-store",
    headers: {
      "x-artist-id": ARTIST_ID,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load pitches (${res.status}) ${text}`);
  }

  const json = await res.json().catch(() => ({}));

  if (Array.isArray(json?.pitches)) return json.pitches;
  if (Array.isArray(json)) return json;

  return [];
}

export default async function AdminPitchesPage() {
  if (!ARTIST_ID) {
    return (
      <main className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Pitches</h1>
            <p className="text-sm text-gray-600">
              Admin page could not load because NEXT_PUBLIC_ARTIST_ID is missing.
            </p>
          </div>

          <a href="/admin" className="px-4 py-2 rounded border border-black">
            ← Back to Admin
          </a>
        </div>

        <div className="border rounded p-4 bg-yellow-50 text-sm text-yellow-900">
          Add <strong>NEXT_PUBLIC_ARTIST_ID</strong> to <strong>.env.local</strong> and
          restart the frontend.
        </div>
      </main>
    );
  }

  let pitches: PitchRow[] = [];
  let loadError = "";

  try {
    pitches = await getPitches();
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load pitches.";
  }

  const totalCount = pitches.length;
  const draftCount = pitches.filter((p) => p.status === "DRAFT").length;
  const queuedCount = pitches.filter((p) => p.status === "QUEUED").length;
  const sentCount = pitches.filter((p) => p.status === "SENT").length;
  const failedCount = pitches.filter((p) => p.status === "FAILED").length;

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Pitches</h1>
          <p className="text-sm text-gray-600">
            Review pitch status, email readiness, and send queue state.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <a href="/admin" className="px-4 py-2 rounded border border-black">
            ← Back to Admin
          </a>
          <a href="/admin/pitches" className="px-4 py-2 rounded border border-black">
            Refresh
          </a>
        </div>
      </div>

      {loadError ? (
        <div className="border rounded p-4 bg-red-50 text-sm text-red-700">
          <strong>Could not load pitches.</strong>
          <div className="mt-1">{loadError}</div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="border rounded p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Total</div>
          <div className="mt-1 text-2xl font-bold">{totalCount}</div>
        </div>

        <div className="border rounded p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Draft</div>
          <div className="mt-1 text-2xl font-bold">{draftCount}</div>
        </div>

        <div className="border rounded p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Queued</div>
          <div className="mt-1 text-2xl font-bold">{queuedCount}</div>
        </div>

        <div className="border rounded p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Sent</div>
          <div className="mt-1 text-2xl font-bold">{sentCount}</div>
        </div>

        <div className="border rounded p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Failed</div>
          <div className="mt-1 text-2xl font-bold">{failedCount}</div>
        </div>
      </div>

      {!loadError ? <SendQueuedEmailsButton /> : null}

      {!loadError && pitches.length === 0 ? (
        <div className="border rounded p-6 text-sm text-gray-500">
          No pitches found yet.
        </div>
      ) : null}

      {!loadError && pitches.length > 0 ? (
        <div className="grid gap-4">
          {pitches.map((pitch, index) => {
            const pitchId = pitch.id ?? `pitch-${index}`;
            const subject = pitch.subject?.trim() || "(No subject)";
            const body = pitch.body ?? "";
            const status = pitch.status ?? "—";
            const channel = pitch.channel ?? "—";
            const sentTo = pitch.sentTo || pitch.curator?.email || "—";
            const createdAt = formatDate(pitch.createdAt);
            const trackTitle = pitch.track?.title || "Untitled track";
            const trackId = pitch.track?.id || null;
            const playlistName = pitch.playlist?.name || "—";
            const curatorName = pitch.curator?.name || "—";
            const curatorEmail = pitch.curator?.email || "—";
            const canEmail =
              pitch.curator?.canEmail === true
                ? "Yes"
                : pitch.curator?.canEmail === false
                ? "No"
                : "—";

            return (
              <div key={pitchId} className="border rounded p-4 space-y-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold">{subject}</h2>

                    <p className="text-sm text-gray-700">
                      <strong>Track:</strong> {trackTitle}
                    </p>

                    <p className="text-sm text-gray-700">
                      <strong>Playlist:</strong> {playlistName}
                    </p>

                    <p className="text-sm text-gray-700">
                      <strong>Curator:</strong> {curatorName}
                    </p>

                    <p className="text-sm text-gray-700">
                      <strong>Curator Email:</strong> {curatorEmail}
                    </p>
                  </div>

                  <div className="text-sm space-y-1 min-w-[220px]">
                    <p>
                      <strong>Pitch ID:</strong> {pitch.id ?? "—"}
                    </p>
                    <p>
                      <strong>Status:</strong> {status}
                    </p>
                    <p>
                      <strong>Channel:</strong> {channel}
                    </p>
                    <p>
                      <strong>Sent To:</strong> {sentTo}
                    </p>
                    <p>
                      <strong>Created:</strong> {createdAt}
                    </p>
                    <p>
                      <strong>Can Email:</strong> {canEmail}
                    </p>
                  </div>
                </div>

                <div className="text-sm">
                  <strong>Body:</strong>
                  <pre className="mt-2 p-3 rounded bg-gray-100 overflow-x-auto whitespace-pre-wrap text-xs">
                    {body}
                  </pre>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {pitch.id ? (
                    <a
                      href={`/pitches/${pitch.id}`}
                      className="px-3 py-2 rounded bg-black text-white text-sm"
                    >
                      Open Pitch
                    </a>
                  ) : null}

                  {trackId ? (
                    <a
                      href={`/tracks/${trackId}`}
                      className="px-3 py-2 rounded border border-black text-sm"
                    >
                      Open Track
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}