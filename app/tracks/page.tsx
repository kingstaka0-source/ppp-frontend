import Link from "next/link";

export const dynamic = "force-dynamic";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

type OverviewTrack = {
  id: string;
  spotifyTrackId: string;
  title: string;
  artists: string[];
  durationMs: number;
  createdAt: string;
  matchCount: number;
};

function msToMinSec(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default async function TracksPage() {
  if (!ARTIST_ID) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="border rounded-xl p-6">
          Missing <b>NEXT_PUBLIC_ARTIST_ID</b> in <code>.env.local</code>.
        </div>
      </div>
    );
  }

  const res = await fetch(`${API}/dashboard/artist/${ARTIST_ID}/overview`, { cache: "no-store" });
  const data = await res.json();
  const tracks: OverviewTrack[] = data?.tracks ?? [];

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tracks</h1>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded border border-black hover:bg-black hover:text-white transition"
        >
          ← Dashboard
        </Link>
      </div>

      {tracks.length === 0 ? (
        <div className="border rounded-xl p-6 text-gray-700">Nog geen tracks.</div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b bg-gray-50">
                <th className="py-3 px-4">Track</th>
                <th className="py-3 px-4">Artists</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Matches</th>
                <th className="py-3 px-4">Added</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>

            <tbody>
              {tracks.map((t) => (
                <tr key={t.id} className="border-b">
                  <td className="py-3 px-4 font-semibold">{t.title}</td>
                  <td className="py-3 px-4 text-gray-700">{(t.artists ?? []).join(", ")}</td>
                  <td className="py-3 px-4 font-mono">{msToMinSec(t.durationMs)}</td>
                  <td className="py-3 px-4 font-mono">{t.matchCount ?? 0}</td>
                  <td className="py-3 px-4 text-gray-700">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <Link className="underline" href={`/tracks/${t.id}`}>
                      View matches →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Showing {tracks.length} track{tracks.length === 1 ? "" : "s"} for artist{" "}
        <span className="font-mono">{ARTIST_ID}</span>
      </div>
    </div>
  );
}