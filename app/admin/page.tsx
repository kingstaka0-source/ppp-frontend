export default function AdminPage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin</h1>

      <div className="flex gap-3 flex-wrap">
        <a
          href="/admin/curators"
          className="px-4 py-2 rounded bg-black text-white"
        >
          View Curators
        </a>

        <a
          href="/admin/playlists"
          className="px-4 py-2 rounded bg-black text-white"
        >
          View Playlists
        </a>

        <a
          href="/pitches"
          className="px-4 py-2 rounded border border-black"
        >
          View Pitches
        </a>
      </div>
    </main>
  );
}
