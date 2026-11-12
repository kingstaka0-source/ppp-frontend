
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const API =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

type SubmissionStatus =
    | "PENDING"
    | "IN_REVIEW"
    | "ACCEPTED"
    | "REJECTED";

type Submission = {
    id: string;
    status: SubmissionStatus;
    submittedAt: string;
    reviewedAt: string | null;
    reviewNotes: string | null;
    track: {
        id: string;
        title: string;
        artists: string[];
        spotifyTrackId: string | null;
        spotifyUrl: string | null;
    };
    playlist: {
        id: string;
        name: string;
    };
    artist: {
        id: string;
        name: string;
    };
};

type Filter = "ALL" | SubmissionStatus;

const statusLabels: Record<SubmissionStatus, string> = {
    PENDING: "Pending",
    IN_REVIEW: "In review",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
};

const statusStyles: Record<SubmissionStatus, string> = {
    PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    IN_REVIEW: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    ACCEPTED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    REJECTED: "border-red-400/30 bg-red-400/10 text-red-300",
};

function formatDate(value: string | null) {
    if (!value) return "â€”";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "â€”"
        : date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
}

function getErrorMessage(value: unknown, fallback: string) {
    if (value && typeof value === "object") {
        const data = value as {
            error?: unknown;
            message?: unknown;
        };

        if (typeof data.message === "string") return data.message;
        if (typeof data.error === "string") return data.error;
    }

    return fallback;
}

export default function CuratorSubmissionsClient() {
    const { isLoaded, isSignedIn, getToken } = useAuth();

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filter, setFilter] = useState<Filter>("ALL");
    const [search, setSearch] = useState("");

    const [notes, setNotes] = useState<Record<string, string>>({});
    const [savingId, setSavingId] = useState<string | null>(null);

    const [actionError, setActionError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const loadSubmissions = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true);
            setError(null);

            try {
                const token = await getToken();

                if (!token) {
                    throw new Error("Authentication token unavailable.");
                }

                const response = await fetch(`${API}/curator/submissions`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                    signal,
                });

                const result: {
                    ok?: boolean;
                    submissions?: Submission[];
                    error?: string;
                    message?: string;
                } = await response.json();

                if (
                    !response.ok ||
                    !result.ok ||
                    !Array.isArray(result.submissions)
                ) {
                    throw new Error(
                        getErrorMessage(
                            result,
                            `Request failed (${response.status})`
                        )
                    );
                }

                if (signal?.aborted) return;

                setSubmissions(result.submissions);

                setNotes(
                    Object.fromEntries(
                        result.submissions.map((item) => [
                            item.id,
                            item.reviewNotes ?? "",
                        ])
                    )
                );
            } catch (err) {
                if (signal?.aborted) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : "Could not load submissions."
                );
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [getToken]
    );

    useEffect(() => {
        if (!isLoaded) return;

        if (!isSignedIn) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();

        void loadSubmissions(controller.signal);

        return () => controller.abort();
    }, [isLoaded, isSignedIn, loadSubmissions]);

    const stats = useMemo(
        () => ({
            total: submissions.length,
            pending: submissions.filter(
                (item) => item.status === "PENDING"
            ).length,
            inReview: submissions.filter(
                (item) => item.status === "IN_REVIEW"
            ).length,
            reviewed: submissions.filter(
                (item) =>
                    item.status === "ACCEPTED" ||
                    item.status === "REJECTED"
            ).length,
        }),
        [submissions]
    );

    const visible = useMemo(() => {
        const query = search.trim().toLowerCase();

        return submissions.filter((submission) => {
            if (
                filter !== "ALL" &&
                submission.status !== filter
            ) {
                return false;
            }

            if (!query) return true;

            return [
                submission.track.title,
                submission.artist.name,
                submission.playlist.name,
                ...(submission.track.artists ?? []),
            ].some((value) =>
                value.toLowerCase().includes(query)
            );
        });
    }, [submissions, filter, search]);

    async function review(
        id: string,
        status: Exclude<SubmissionStatus, "PENDING">
    ) {
        if (savingId) return;

        const submission = submissions.find(
            (item) => item.id === id
        );

        if (
            !submission ||
            submission.status === "ACCEPTED" ||
            submission.status === "REJECTED"
        ) {
            return;
        }

        const reviewNotes = notes[id] ?? "";

        if (reviewNotes.length > 2000) {
            setActionError(
                "Review notes cannot exceed 2000 characters."
            );
            return;
        }

        setSavingId(id);
        setActionError(null);
        setSuccess(null);

        try {
            const token = await getToken();

            if (!token) {
                throw new Error("Authentication token unavailable.");
            }

            const response = await fetch(
                `${API}/curator/submissions/${encodeURIComponent(id)}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        status,
                        reviewNotes,
                    }),
                }
            );

            const result: {
                ok?: boolean;
                submission?: {
                    id: string;
                    status: SubmissionStatus;
                    reviewedAt: string | null;
                    reviewNotes: string | null;
                };
                error?: string;
                message?: string;
            } = await response.json();

            if (
                !response.ok ||
                !result.ok ||
                !result.submission
            ) {
                throw new Error(
                    getErrorMessage(
                        result,
                        `Review failed (${response.status})`
                    )
                );
            }

            const updated = result.submission;

            setSubmissions((current) =>
                current.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            status: updated.status,
                            reviewedAt: updated.reviewedAt,
                            reviewNotes: updated.reviewNotes,
                        }
                        : item
                )
            );

            setSuccess(
                `Submission updated to ${statusLabels[updated.status]}.`
            );
        } catch (err) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "Could not update submission."
            );
        } finally {
            setSavingId(null);
        }
    }

    const filters: {
        value: Filter;
        label: string;
    }[] = [
            { value: "ALL", label: "All" },
            { value: "PENDING", label: "Pending" },
            { value: "IN_REVIEW", label: "In review" },
            { value: "ACCEPTED", label: "Accepted" },
            { value: "REJECTED", label: "Rejected" },
        ];

    return (
        <main className="min-h-screen bg-[#090b0a] px-5 py-10 text-white">
            <div className="mx-auto max-w-6xl">
                <header className="mb-9">
                    <div className="mb-8 border-b border-white/10 pb-6">
                        <a
                            href="/curator"
                            aria-label="TuneReach Curator Dashboard"
                        >
                            <img
                                src="/brand/logo.svg"
                                alt="TuneReach"
                                className="h-12 w-auto max-w-[220px] object-contain"
                            />
                        </a>
                    </div>

                    <a
                        href="/curator"
                        className="text-sm font-semibold text-zinc-400 hover:text-[#1ed760]"
                    >
                        â† Back to Curator Dashboard
                    </a>

                    <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-[#1ed760]">
                        TuneReach Curator
                    </p>

                    <h1 className="mt-3 text-4xl font-black">
                        Submission Inbox
                    </h1>

                    <p className="mt-3 text-zinc-400">
                        Listen to incoming tracks, review submissions and manage decisions.
                    </p>
                </header>

                {!isLoaded || loading ? (
                    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8 text-zinc-400">
                        Loading submissions...
                    </div>
                ) : !isSignedIn ? (
                    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-8">
                        <h2 className="text-xl font-bold">
                            Sign in required
                        </h2>

                        <p className="mt-2 text-zinc-400">
                            Sign in to access your curator inbox.
                        </p>
                    </div>
                ) : error === "CURATOR_NOT_FOUND" ? (
    <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8">
        <h2 className="text-2xl font-black text-white">
            Set up your curator account
        </h2>

        <p className="mt-3 max-w-2xl text-zinc-400">
            No curator profile is linked to your account yet.
            Claim and verify your curator profile to receive submissions.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
            <a
                href="/curator/claim"
                className="rounded-xl bg-emerald-400 px-6 py-3 font-bold text-black"
            >
                Claim curator profile
            </a>

            <a
                href="/dashboard"
                className="rounded-xl border border-white/15 px-6 py-3 font-semibold text-white"
            >
                Back to Artist Dashboard
            </a>
        </div>
    </section>
) : error ? (
                    <div
                        role="alert"
                        className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-300"
                    >
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() => void loadSubmissions()}
                            className="mt-4 rounded-xl bg-white/10 px-4 py-2 font-semibold text-white"
                        >
                            Try again
                        </button>
                    </div>
                ) : (
                    <>
                        <section className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    label: "Total Submissions",
                                    value: stats.total,
                                },
                                {
                                    label: "Pending",
                                    value: stats.pending,
                                },
                                {
                                    label: "In Review",
                                    value: stats.inReview,
                                },
                                {
                                    label: "Reviewed",
                                    value: stats.reviewed,
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-3xl border border-white/10 bg-zinc-950 p-6"
                                >
                                    <p className="text-sm text-zinc-400">
                                        {stat.label}
                                    </p>

                                    <p className="mt-3 text-4xl font-black text-[#1ed760]">
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        Incoming Tracks
                                    </h2>

                                    <p className="mt-1 text-sm text-zinc-400">
                                        Showing {visible.length} of{" "}
                                        {submissions.length} submissions
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => void loadSubmissions()}
                                    className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold hover:border-[#1ed760]"
                                >
                                    Refresh
                                </button>
                            </div>

                            <div className="mb-6 flex flex-col gap-3">
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search tracks, artists or playlists..."
                                    aria-label="Search submissions"
                                    className="w-full rounded-xl border border-white/15 bg-[#090b0a] px-4 py-3 text-white outline-none focus:border-[#1ed760]"
                                />

                                <div className="flex flex-wrap gap-2">
                                    {filters.map((item) => (
                                        <button
                                            key={item.value}
                                            type="button"
                                            onClick={() =>
                                                setFilter(item.value)
                                            }
                                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${filter === item.value
                                                ? "border-[#1ed760] bg-[#1ed760] text-black"
                                                : "border-white/15 bg-white/5 text-zinc-300 hover:border-[#1ed760]"
                                                }`}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {actionError && (
                                <p
                                    role="alert"
                                    className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
                                >
                                    {actionError}
                                </p>
                            )}

                            {success && (
                                <p
                                    role="status"
                                    className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
                                >
                                    {success}
                                </p>
                            )}

                            {visible.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
                                    <h3 className="text-lg font-bold">
                                        {submissions.length === 0
                                            ? "No submissions yet"
                                            : "No matching submissions"}
                                    </h3>

                                    <p className="mt-2 text-sm text-zinc-400">
                                        {submissions.length === 0
                                            ? "Incoming tracks for your verified playlists will appear here."
                                            : "Try another search or status filter."}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {visible.map((submission) => {
                                        const isFinal =
                                            submission.status === "ACCEPTED" ||
                                            submission.status === "REJECTED";

                                        const spotifyUrl =
                                            submission.track.spotifyUrl?.startsWith(
                                                "https://open.spotify.com/track/"
                                            )
                                                ? submission.track.spotifyUrl
                                                : submission.track.spotifyTrackId
                                                    ? `https://open.spotify.com/track/${encodeURIComponent(
                                                        submission.track.spotifyTrackId
                                                    )}`
                                                    : null;

                                        return (
                                            <article
                                                key={submission.id}
                                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <h3 className="break-words text-xl font-bold">
                                                            {submission.track.title}
                                                        </h3>

                                                        <p className="mt-1 text-sm text-zinc-300">
                                                            {submission.track.artists?.length
                                                                ? submission.track.artists.join(
                                                                    ", "
                                                                )
                                                                : submission.artist.name}
                                                        </p>

                                                        <p className="mt-2 text-sm text-zinc-400">
                                                            Playlist:{" "}
                                                            {submission.playlist.name}
                                                        </p>

                                                        <p className="mt-1 text-xs text-zinc-500">
                                                            Submitted{" "}
                                                            {formatDate(
                                                                submission.submittedAt
                                                            )}
                                                            {submission.reviewedAt
                                                                ? ` Â· Reviewed ${formatDate(
                                                                    submission.reviewedAt
                                                                )}`
                                                                : ""}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[
                                                            submission.status
                                                        ]
                                                            }`}
                                                    >
                                                        {
                                                            statusLabels[
                                                            submission.status
                                                            ]
                                                        }
                                                    </span>
                                                </div>

                                                <div className="mt-5 flex flex-wrap items-center gap-3">
                                                    {spotifyUrl ? (
                                                        <a
                                                            href={spotifyUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm font-bold text-[#1ed760] hover:underline"
                                                        >
                                                            Listen on Spotify
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm text-zinc-500">
                                                            Spotify link unavailable
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-5">
                                                    <label
                                                        htmlFor={`notes-${submission.id}`}
                                                        className="mb-2 block text-sm font-semibold text-zinc-300"
                                                    >
                                                        Review notes
                                                    </label>

                                                    <textarea
                                                        id={`notes-${submission.id}`}
                                                        value={
                                                            notes[submission.id] ?? ""
                                                        }
                                                        onChange={(event) =>
                                                            setNotes((current) => ({
                                                                ...current,
                                                                [submission.id]:
                                                                    event.target.value,
                                                            }))
                                                        }
                                                        maxLength={2000}
                                                        rows={3}
                                                        disabled={
                                                            isFinal ||
                                                            savingId === submission.id
                                                        }
                                                        placeholder="Add notes about this submission..."
                                                        className="w-full resize-y rounded-xl border border-white/15 bg-[#090b0a] p-4 text-sm text-white outline-none focus:border-[#1ed760] disabled:opacity-60"
                                                    />

                                                    <p className="mt-1 text-right text-xs text-zinc-500">
                                                        {
                                                            (
                                                                notes[
                                                                submission.id
                                                                ] ?? ""
                                                            ).length
                                                        }
                                                        /2000
                                                    </p>
                                                </div>

                                                {!isFinal ? (
                                                    <div className="mt-4 flex flex-wrap gap-3">
                                                        {submission.status ===
                                                            "PENDING" && (
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        savingId !== null
                                                                    }
                                                                    onClick={() =>
                                                                        void review(
                                                                            submission.id,
                                                                            "IN_REVIEW"
                                                                        )
                                                                    }
                                                                    className="rounded-xl border border-sky-400/40 px-4 py-3 text-sm font-bold text-sky-300 disabled:opacity-50"
                                                                >
                                                                    Start Review
                                                                </button>
                                                            )}

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                savingId !== null
                                                            }
                                                            onClick={() =>
                                                                void review(
                                                                    submission.id,
                                                                    "ACCEPTED"
                                                                )
                                                            }
                                                            className="rounded-xl bg-[#1ed760] px-5 py-3 text-sm font-bold text-black hover:bg-[#1fef6d] disabled:opacity-50"
                                                        >
                                                            Accept
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                savingId !== null
                                                            }
                                                            onClick={() =>
                                                                void review(
                                                                    submission.id,
                                                                    "REJECTED"
                                                                )
                                                            }
                                                            className="rounded-xl border border-red-400/40 px-5 py-3 text-sm font-bold text-red-300 disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p className="mt-4 text-sm text-zinc-400">
                                                        This decision is final.
                                                    </p>
                                                )}
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}
