import { Suspense } from "react";
import SpotifyOnboardingClient from "./SpotifyOnboardingClient";

export default function SpotifyOnboardingPage() {
  return (
    <Suspense fallback={<SpotifyPageLoading />}>
      <SpotifyOnboardingClient />
    </Suspense>
  );
}

function SpotifyPageLoading() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <div className="text-xl font-black tracking-tight">
            Tune<span className="text-emerald-400">Reach</span>
          </div>

          <div className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/65">
            Step 2 of 3
          </div>
        </header>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 rounded-full bg-emerald-400" />
        </div>

        <section className="mt-10 flex min-h-[680px] flex-col items-center justify-center rounded-[32px] border border-white/10 bg-zinc-950 px-8 text-center shadow-2xl">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-emerald-400" />

          <h1 className="mt-6 text-2xl font-black">
            Loading Spotify connection
          </h1>

          <p className="mt-3 text-white/45">
            Preparing your secure connection.
          </p>
        </section>
      </div>
    </main>
  );
}