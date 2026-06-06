"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ACCOUNTS = [
  {
    name: "King Staka (PRO)",
    id: "cmmnjti0n0004112o3orl713x",
  },
  {
    name: "Free Test",
    id: "cmn1gunx60000bjtk1jeaq5hg",
  },
];

const DEFAULT_ARTIST_ID = ACCOUNTS[0].id;

const STORAGE_KEY = "ppp_recent_artist_ids";

function normalize(value: string) {
  return value.trim();
}

export default function AccountSwitcher() {
  console.log("ACCOUNT SWITCHER LOADED");
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentArtistId =
    searchParams.get("artistId")?.trim() || DEFAULT_ARTIST_ID;

  const [value, setValue] = useState(currentArtistId);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    setValue(currentArtistId);
  }, [currentArtistId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      const clean = parsed.map(normalize).filter(Boolean);
      setRecentIds(clean);
    } catch {
      setRecentIds([]);
    }
  }, []);

  const options = useMemo(() => {
    const set = new Set<string>();
    if (currentArtistId) set.add(currentArtistId);
    if (DEFAULT_ARTIST_ID) set.add(DEFAULT_ARTIST_ID);
    for (const id of recentIds) {
      if (id) set.add(id);
    }
    return Array.from(set);
  }, [currentArtistId, recentIds]);

  function persistRecent(nextId: string) {
    const clean = normalize(nextId);
    if (!clean) return;

    const merged = [clean, ...recentIds.filter((id) => id !== clean)].slice(0, 10);
    setRecentIds(merged);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }

  function goToArtist(nextId: string) {
    const clean = normalize(nextId);
    if (!clean) return;

    persistRecent(clean);

    const params = new URLSearchParams(searchParams.toString());
    params.set("artistId", clean);

    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  }

  function removeSaved(id: string) {
    const next = recentIds.filter((x) => x !== id);
    setRecentIds(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return (
    <div className="border rounded-xl p-4 space-y-3">
      <div className="font-semibold">Account switcher</div>

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste artistId..."
          className="flex-1 border rounded px-3 py-2"
        />

        <button
          onClick={() => goToArtist(value)}
          className="px-4 py-2 rounded bg-black text-white"
        >
          Switch
        </button>
      </div>

      {options.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {ACCOUNTS.map((account) => (
  <button
    key={account.id}
    onClick={() => goToArtist(account.id)}
    className={`px-3 py-1 rounded border text-sm ${
      account.id === currentArtistId
        ? "bg-black text-white"
        : ""
    }`}
  >
    {account.name}
  </button>
))}
        </div>
      ) : null}

      {recentIds.length > 0 ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Saved artist IDs</div>

          <div className="space-y-2">
            {recentIds.map((id) => (
              <div key={id} className="flex items-center justify-between gap-3 border rounded px-3 py-2">
                <button
                  onClick={() => goToArtist(id)}
                  className="text-left text-sm underline break-all"
                >
                  {id}
                </button>

                <button
                  onClick={() => removeSaved(id)}
                  className="text-xs text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="text-xs text-gray-500">
        Current: {currentArtistId || "none"}
      </div>
    </div>
  );
}