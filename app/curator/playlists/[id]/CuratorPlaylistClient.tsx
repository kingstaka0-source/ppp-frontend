"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";

const API =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

type Playlist = {
    id: string;
    name: string;
    description: string | null;
    spotifyUrl: string | null;
    ownerDisplayName: string | null;
    imageUrl: string | null;
    genres: string[];
    minBpm: number | null;
    maxBpm: number | null;
    minEnergy: number | null;
    maxEnergy: number | null;
    verificationStatus: string;
    rules: unknown;
};

type PlaylistResponse = {
    ok: boolean;
    playlist: Playlist;
};

type CuratorSettings = {
    acceptingSubmissions?: boolean;
    submissionInstructions?: string;
};

type PlaylistDraft = {
    genres: string;
    minBpm: string;
    maxBpm: string;
    minEnergy: string;
    maxEnergy: string;
    acceptingSubmissions: boolean;
    submissionInstructions: string;
};

function getCuratorSettings(rules: unknown): CuratorSettings {
    if (!rules || typeof rules !== "object" || Array.isArray(rules)) {
        return {};
    }

    const settings = (rules as Record<string, unknown>).curatorSettings;

    if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
        return {};
    }

    const values = settings as Record<string, unknown>;

    return {
        acceptingSubmissions:
            typeof values.acceptingSubmissions === "boolean"
                ? values.acceptingSubmissions
                : undefined,
        submissionInstructions:
            typeof values.submissionInstructions === "string"
                ? values.submissionInstructions
                : undefined,
    };
}

function validatePlaylistDraft(draft: PlaylistDraft): string | null {
  const genres = draft.genres
    .split(",")
    .map((genre) => genre.trim())
    .filter(Boolean);

  if (genres.length > 20) {
    return "Maximum 20 genres allowed.";
  }

  if (genres.some((genre) => genre.length > 60)) {
    return "Each genre must contain no more than 60 characters.";
  }

  for (const field of ["minBpm", "maxBpm"] as const) {
    const value = draft[field].trim();

    if (value === "") continue;

    const number = Number(value);

    if (!Number.isInteger(number) || number < 0 || number > 300) {
      return "BPM must be a whole number between 0 and 300.";
    }
  }

  for (const field of ["minEnergy", "maxEnergy"] as const) {
    const value = draft[field].trim();

    if (value === "") continue;

    const number = Number(value);

    if (!Number.isFinite(number) || number < 0 || number > 100) {
      return "Energy must be between 0 and 100%.";
    }
  }

  if (
    draft.minBpm.trim() !== "" &&
    draft.maxBpm.trim() !== "" &&
    Number(draft.minBpm) > Number(draft.maxBpm)
  ) {
    return "Minimum BPM cannot exceed maximum BPM.";
  }

  if (
    draft.minEnergy.trim() !== "" &&
    draft.maxEnergy.trim() !== "" &&
    Number(draft.minEnergy) > Number(draft.maxEnergy)
  ) {
    return "Minimum energy cannot exceed maximum energy.";
  }

  if (draft.submissionInstructions.length > 2000) {
    return "Submission instructions cannot exceed 2,000 characters.";
  }

  return null;
}
type PlaylistPatch = {
    genres?: string[];
    minBpm?: number | null;
    maxBpm?: number | null;
    minEnergy?: number | null;
    maxEnergy?: number | null;
    acceptingSubmissions?: boolean;
    submissionInstructions?: string;
};

function buildPlaylistPatch(
    playlist: Playlist,
    draft: PlaylistDraft
): PlaylistPatch {
    const patch: PlaylistPatch = {};

    const genres = draft.genres
        .split(",")
        .map((genre) => genre.trim())
        .filter(Boolean);

    if (JSON.stringify(genres) !== JSON.stringify(playlist.genres)) {
        patch.genres = genres;
    }

    for (const field of ["minBpm", "maxBpm"] as const) {
        const value =
            draft[field].trim() === ""
                ? null
                : Number(draft[field]);

        if (value !== playlist[field]) {
            patch[field] = value;
        }
    }

    for (const field of ["minEnergy", "maxEnergy"] as const) {
        const value =
            draft[field].trim() === ""
                ? null
                : Number(draft[field]) / 100;

        const original = playlist[field];

        if (
            original !== null &&
            draft[field].trim() === String(Math.round(original * 100))
        ) {
            continue;
        }

        if (value !== original) {
            patch[field] = value;
        }
    }

    const settings = getCuratorSettings(playlist.rules);

    if (
        settings.acceptingSubmissions !== undefined &&
        draft.acceptingSubmissions !== settings.acceptingSubmissions
    ) {
        patch.acceptingSubmissions = draft.acceptingSubmissions;
    }

    if (
        settings.acceptingSubmissions === undefined &&
        draft.acceptingSubmissions === true
    ) {
        patch.acceptingSubmissions = true;
    }

    if (
        draft.submissionInstructions !==
        (settings.submissionInstructions ?? "")
    ) {
        patch.submissionInstructions = draft.submissionInstructions;
    }

    return patch;
}
function displayRange(
    minimum: number | null,
    maximum: number | null,
    suffix = ""
) {
    if (minimum === null && maximum === null) {
        return "Not configured";
    }

    if (minimum !== null && maximum !== null) {
        return `${minimum}${suffix} - ${maximum}${suffix}`;
    }

    if (minimum !== null) {
        return `From ${minimum}${suffix}`;
    }

    return `Up to ${maximum}${suffix}`;
}

function displayEnergy(value: number | null) {
    return value === null ? null : Math.round(value * 100);
}

export default function CuratorPlaylistClient() {
    const params = useParams();
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const playlistId =
        typeof params.id === "string" ? params.id : "";

    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editing, setEditing] = useState(false);

    const [draft, setDraft] = useState<PlaylistDraft>({
        genres: "",
        minBpm: "",
        maxBpm: "",
        minEnergy: "",
        maxEnergy: "",
        acceptingSubmissions: false,
        submissionInstructions: "",
    });

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    const [needsRefresh, setNeedsRefresh] = useState(false);

    async function savePlaylistSettings() {
        if (!playlist || saving) return;

        setSaveError(null);
        setSaveSuccess(null);

        const validationError = validatePlaylistDraft(draft);

        if (validationError) {
            setSaveError(validationError);
            return;
        }

        const patch = buildPlaylistPatch(playlist, draft);

        if (Object.keys(patch).length === 0) {
            setEditing(false);
            setSaveSuccess("No changes were necessary.");
            return;
        }

        setSaving(true);

        try {
            const token = await getToken();

            if (!token) {
                throw new Error("Authentication token unavailable.");
            }

            const url = `${API}/curator/playlists/${encodeURIComponent(playlistId)}`;

            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(patch),
            });

            const result = (await response.json()) as {
                ok?: boolean;
                error?: string;
                message?: string;
            };

            if (!response.ok || !result.ok) {
                throw new Error(
                    result.message ||
                    result.error ||
                    "Could not save playlist settings."
                );
            }

            setEditing(false);
            setSaveSuccess("Playlist settings saved successfully.");

            try {
                const refreshed = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                });

                if (!refreshed.ok) {
                    throw new Error("Playlist refresh failed.");
                }

                const refreshedResult =
                    (await refreshed.json()) as PlaylistResponse;

                if (!refreshedResult.ok || !refreshedResult.playlist) {
                    throw new Error("Invalid playlist refresh response.");
                }

                setPlaylist(refreshedResult.playlist);
                setNeedsRefresh(false);
            } catch {
                setNeedsRefresh(true);
                setSaveSuccess(
                    "Settings saved, but the latest playlist details could not be loaded. Refresh the page before editing again."
                );
                setSaveError(null);
            }
        } catch (err) {
            setSaveError(
                err instanceof Error
                    ? err.message
                    : "Could not save playlist settings."
            );
        } finally {
            setSaving(false);
        }
    }
    function startEditing() {
        if (!playlist || needsRefresh || saving) return;

        const currentSettings = getCuratorSettings(playlist.rules);

        setDraft({
            genres: playlist.genres.join(", "),
            minBpm: playlist.minBpm?.toString() ?? "",
            maxBpm: playlist.maxBpm?.toString() ?? "",
            minEnergy:
                playlist.minEnergy === null
                    ? ""
                    : String(Math.round(playlist.minEnergy * 100)),
            maxEnergy:
                playlist.maxEnergy === null
                    ? ""
                    : String(Math.round(playlist.maxEnergy * 100)),
            acceptingSubmissions:
                currentSettings.acceptingSubmissions ?? false,
            submissionInstructions:
                currentSettings.submissionInstructions ?? "",
        });

        setEditing(true);
    }

    function cancelEditing() {
        if (saving) return;
        setEditing(false);
    }

    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn) {
            setError("Please sign in to manage your playlists.");
            setLoading(false);
            return;
        }

        if (!playlistId) {
            setError("Playlist ID is missing.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function loadPlaylist() {
            setLoading(true);
            setError(null);
            setPlaylist(null);

            try {
                const token = await getToken();

                if (!token) {
                    throw new Error("Authentication token unavailable.");
                }

                const response = await fetch(
                    `${API}/curator/playlists/${encodeURIComponent(playlistId)}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        cache: "no-store",
                    }
                );

                const result = (await response.json()) as
                    | PlaylistResponse
                    | { error?: string; message?: string };

                if (!response.ok) {
                    const failure = result as {
                        error?: string;
                        message?: string;
                    };

                    throw new Error(
                        failure.message ||
                        (response.status === 404
                            ? "Playlist not found or not verified for your account."
                            : failure.error || "Could not load playlist.")
                    );
                }

                const data = result as PlaylistResponse;

                if (!data.ok || !data.playlist) {
                    throw new Error("Invalid playlist response.");
                }

                if (!cancelled) {
                    setPlaylist(data.playlist);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Could not load playlist."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadPlaylist();

        return () => {
            cancelled = true;
        };
    }, [getToken, isLoaded, isSignedIn, playlistId]);

    const draftError = editing ? validatePlaylistDraft(draft) : null;
    const hasChanges =
        editing &&
        playlist !== null &&
        Object.keys(buildPlaylistPatch(playlist, draft)).length > 0;
    const settings = getCuratorSettings(playlist?.rules);

    return (
        <main className="min-h-screen bg-[#090b0a] px-5 py-10 text-white">
            <div className="mx-auto max-w-6xl">
                <header className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-6">
                    <a href="/curator" aria-label="TuneReach Curator Dashboard">
                        <img
                            src="/brand/logo.svg"
                            alt="TuneReach"
                            className="h-12 w-auto max-w-[220px] object-contain"
                        />
                    </a>

                    <a
                        href="/curator"
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-[#1ed760] transition hover:bg-white/10"
                    >
                        Back to Curator Dashboard
                    </a>
                </header>

                <div className="mt-8">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#1ed760]">
                        TuneReach Curator Workspace
                    </p>

                    <h1 className="mt-3 text-4xl font-black">
                        Playlist Management
                    </h1>

                    <p className="mt-3 text-zinc-400">
                        Manage your verified Spotify playlist settings.
                    </p>
                </div>

                {loading && (
                    <section className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-8 text-zinc-400">
                        Loading playlist...
                    </section>
                )}

                {saveSuccess && (
                    <p role="status" className="mt-6 rounded-xl border border-[#1ed760]/30 bg-[#1ed760]/10 px-5 py-4 text-sm font-semibold text-[#1ed760]">
                        {saveSuccess}
                    </p>
                )}

                {saveError && (
                    <p role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-300">
                        {saveError}
                    </p>
                )}
                {!loading && error && (
                    <section className="mt-8 rounded-3xl border border-red-500/20 bg-zinc-950 p-8">
                        <p className="font-semibold text-red-300">
                            Unable to load playlist
                        </p>
                        <p className="mt-2 text-sm text-zinc-400">{error}</p>
                    </section>
                )}

                {!loading && !error && playlist && (
                    <>
                        <section className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-6 md:p-8">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                                {playlist.imageUrl?.startsWith("https://") ? (
                                    <img
                                        src={playlist.imageUrl}
                                        alt={`${playlist.name} Spotify playlist cover`}
                                        className="h-40 w-40 shrink-0 rounded-2xl object-cover"
                                    />
                                ) : (
                                    <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 text-5xl text-[#1ed760]">
                                        ♫
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                                        {playlist.verificationStatus}
                                    </span>

                                    <h2 className="mt-4 break-words text-3xl font-black">
                                        {playlist.name}
                                    </h2>

                                    <p className="mt-2 text-sm text-zinc-400">
                                        Owner: {playlist.ownerDisplayName || "Unknown"}
                                    </p>

                                    {playlist.description && (
                                        <p className="mt-4 text-sm text-zinc-300">
                                            {playlist.description}
                                        </p>
                                    )}

                                    {playlist.spotifyUrl && (
                                        <a
                                            href={playlist.spotifyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-5 inline-block text-sm font-bold text-[#1ed760] hover:underline"
                                        >
                                            Open on Spotify
                                        </a>
                                    )}
                                </div>
                            </div>
                        </section>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
  <div>
    <h3 className="text-xl font-bold">Playlist Settings</h3>
    <p className="mt-1 text-sm text-zinc-400">
      Configure how artists are matched with your playlist.
    </p>
  </div>

  <button
    type="button"
    onClick={editing ? cancelEditing : startEditing}
    disabled={saving || needsRefresh}
    className="rounded-xl bg-[#1ed760] px-5 py-3 text-sm font-bold text-black hover:bg-[#1fef6d] disabled:cursor-not-allowed disabled:opacity-40"
  >
    {editing ? "Cancel" : "Edit Settings"}
  </button>
</div>

{editing && (
  <section className="mt-6 rounded-3xl border border-[#1ed760]/30 bg-zinc-950 p-6">
    <h3 className="text-xl font-bold">Edit Playlist Settings</h3>

    <p className="mt-2 text-sm text-zinc-400">
      Changes are not saved yet.
    </p>

    <div className="mt-6 grid gap-5 sm:grid-cols-2">
      <label className="block sm:col-span-2">
        <span className="text-sm font-semibold">Genres</span>
        <input
          type="text"
          value={draft.genres}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              genres: event.target.value,
            }))
          }
          placeholder="Reggae, Roots Reggae, Dub"
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#090b0a] px-4 py-3 text-white outline-none focus:border-[#1ed760]"
        />
      </label>

      {(
        [
          ["minBpm", "Minimum BPM"],
          ["maxBpm", "Maximum BPM"],
          ["minEnergy", "Minimum Energy (%)"],
          ["maxEnergy", "Maximum Energy (%)"],
        ] as const
      ).map(([field, label]) => (
        <label key={field} className="block">
          <span className="text-sm font-semibold">{label}</span>
          <input
            type="number"
            min={0}
            max={field.endsWith("Bpm") ? 300 : 100}
            step={1}
            value={draft[field]}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                [field]: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#090b0a] px-4 py-3 text-white outline-none focus:border-[#1ed760]"
          />
        </label>
      ))}

      <label className="flex items-center gap-3 sm:col-span-2">
        <input
          type="checkbox"
          checked={draft.acceptingSubmissions}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              acceptingSubmissions: event.target.checked,
            }))
          }
          className="h-5 w-5 accent-[#1ed760]"
        />
        <span className="text-sm font-semibold">
          Accepting Submissions
        </span>
      </label>

      <label className="block sm:col-span-2">
        <span className="text-sm font-semibold">
          Submission Instructions
        </span>
        <textarea
          rows={5}
          maxLength={2000}
          value={draft.submissionInstructions}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              submissionInstructions: event.target.value,
            }))
          }
          placeholder="Describe what kind of music you accept..."
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#090b0a] px-4 py-3 text-white outline-none focus:border-[#1ed760]"
        />
      </label>
    </div>

    {draftError && (
      <p role="alert" className="mt-4 text-sm font-semibold text-red-300">
        {draftError}
      </p>
    )}
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => void savePlaylistSettings()}
        disabled={saving || Boolean(draftError) || !hasChanges}
        className="rounded-xl bg-[#1ed760] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#1fef6d] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

      <button
        type="button"
        onClick={cancelEditing}
        disabled={saving}
        className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Cancel
      </button>
    </div>
  </section>
)}
<div className="mt-6 grid gap-6 lg:grid-cols-2">
                            <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
                                <h3 className="text-xl font-bold">
                                    Music Preferences
                                </h3>

                                <p className="mt-2 text-sm text-zinc-500">
                                    These settings help TuneReach match tracks with your playlist.
                                </p>

                                <div className="mt-6">
                                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Genres
                                    </p>

                                    {playlist.genres.length > 0 ? (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {playlist.genres.map((genre) => (
                                                <span
                                                    key={genre}
                                                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200"
                                                >
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-sm text-zinc-400">
                                            No genres configured.
                                        </p>
                                    )}
                                </div>

                                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                            BPM Range
                                        </p>
                                        <p className="mt-3 text-xl font-bold">
                                            {displayRange(
                                                playlist.minBpm,
                                                playlist.maxBpm
                                            )}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                            Energy Range
                                        </p>
                                        <p className="mt-3 text-xl font-bold">
                                            {displayRange(
                                                displayEnergy(playlist.minEnergy),
                                                displayEnergy(playlist.maxEnergy),
                                                "%"
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
                                <h3 className="text-xl font-bold">
                                    Submission Settings
                                </h3>

                                <p className="mt-2 text-sm text-zinc-500">
                                    Your preferences for incoming artist submissions.
                                </p>

                                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Accepting Submissions
                                    </p>

                                    <p className="mt-3 text-lg font-bold">
                                        {settings.acceptingSubmissions === undefined
                                            ? "Not configured"
                                            : settings.acceptingSubmissions
                                                ? "Yes"
                                                : "No"}
                                    </p>
                                </div>

                                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                        Submission Instructions
                                    </p>

                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                                        {settings.submissionInstructions ||
                                            "No submission instructions configured."}
                                    </p>
                                </div>
                            </section>
                        </div>

                        <p className="mt-6 text-xs text-zinc-500">
                            Manage your playlist preferences and submission settings.
                        </p>
                    </>
                )}
            </div>
        </main>
    );
}