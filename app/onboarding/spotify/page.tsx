"use client";

import { useRouter } from "next/navigation";

export default function SpotifyOnboardingPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
      <section className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-zinc-950 p-8 text-center shadow-2xl sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#1ed760] text-4xl">
          🎧
        </div>

        <p className="mt-8 text-sm font-bold uppercase tracking-[0.22em] text-emerald-400">
          Step 2 of 3
        </p>

        <h1 className="mt-4 text-4xl font-black sm:text-5xl">
          Connect your Spotify artist profile
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/55">
          Import your releases and prepare your first TuneReach playlist
          campaign.
        </p>

        <button
          type="button"
          onClick={() => router.push("/onboarding/import-track")}
          className="mt-9 rounded-2xl bg-[#1ed760] px-8 py-4 font-black text-black transition hover:brightness-110"
        >
          Connect Spotify
        </button>

        <p className="mt-5 text-sm text-white/35">
          We never publish or modify anything on your Spotify account.
        </p>
      </section>
    </main>
  );
}