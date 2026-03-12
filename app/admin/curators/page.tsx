const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

type Curator = {
  id: string;
  name: string;
  email: string | null;
  contactMethod: "EMAIL" | "INAPP";
  consent: boolean;
  languages: string[];
  createdAt: string;
  playlistCount: number;
  canEmail: boolean;
  playlists: {
    id: string;
    name: string;
    spotifyPlaylistId: string | null;
    createdAt: string;
  }[];
};

async function getCurators(): Promise<Curator[]> {
  const res = await fetch(`${API}/curators`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load curators (${res.status})`);
  }

  const json = await res.json();
  return json?.curators || [];
}

export default async function AdminCuratorsPage() {
  const curators = await getCurators();

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Curators</h1>
          <p className="text-sm text-gray-600">Total: {curators.length}</p>
        </div>

        <a
          href="/admin"
          className="px-4 py-2 rounded border border-black"
        >
          ← Back to Admin
        </a>
      </div>

      <div className="grid gap-4">
        {curators.map((curator) => (
          <div key={curator.id} className="border rounded p-4 space-y-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-semibold">{curator.name}</h2>
                <p className="text-sm text-gray-700">
                  {curator.email || "No email"}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <span className="text-xs px-2 py-1 rounded border">
                  {curator.contactMethod}
                </span>

                <span className="text-xs px-2 py-1 rounded border">
                  Consent: {curator.consent ? "Yes" : "No"}
                </span>

                <span className="text-xs px-2 py-1 rounded border">
                  Can Email: {curator.canEmail ? "Yes" : "No"}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <strong>ID:</strong> {curator.id}
              </p>
              <p>
                <strong>Languages:</strong>{" "}
                {curator.languages?.length ? curator.languages.join(", ") : "-"}
              </p>
              <p>
                <strong>Playlists:</strong> {curator.playlistCount}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(curator.createdAt).toLocaleString()}
              </p>
            </div>

            {curator.playlists?.length > 0 ? (
              <div className="space-y-2">
                <h3 className="font-medium">Playlists</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4">Name</th>
                        <th className="text-left py-2 pr-4">Spotify ID</th>
                        <th className="text-left py-2 pr-4">Open</th>
                      </tr>
                    </thead>
                    <tbody>
                      {curator.playlists.map((playlist) => (
                        <tr key={playlist.id} className="border-b align-top">
                          <td className="py-2 pr-4">{playlist.name}</td>
                          <td className="py-2 pr-4">
                            {playlist.spotifyPlaylistId || "-"}
                          </td>
                          <td className="py-2 pr-4">
                            <a
                              href={`/admin/playlists/${playlist.id}`}
                              className="underline"
                            >
                              Open
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No playlists yet.</p>
            )}
          </div>
        ))}

        {curators.length === 0 ? (
          <div className="border rounded p-6 text-sm text-gray-500">
            No curators found.
          </div>
        ) : null}
      </div>
    </main>
  );
}