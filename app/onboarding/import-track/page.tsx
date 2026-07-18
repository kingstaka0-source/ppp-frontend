"use client";

import { useRouter } from "next/navigation";

export default function ImportTrackOnboardingPage() {
  const router = useRouter();

  function finishSetup() {
    const artistId = localStorage.getItem("tunereachArtistId");

    if (!artistId) {
      router.replace("/onboarding");
      return;
    }

    router.replace(
      `/dashboard?artistId=${encodeURIComponent(artistId)}`
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
      <section className="w-full max-w-3xl rounded-[32px] border border-white/10 bg-zinc-950 p-8 shadow-2xl sm:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-400">
          Step 3 of 3
        </p>

        <h1 className="mt-4 text-4xl font-black sm:text-5xl">
          Import your first track
        </h1>

        <p className="mt-5 text-lg leading-8 text-white/55">
          Your Spotify releases will appear here after the account connection
          is completed.
        </p>

        <div className="mt-9 rounded-3xl border border-dashed border-white/15 bg-white/[0.025] p-10 text-center">
          <div className="text-5xl">📀</div>
          <h2 className="mt-5 text-xl font-bold">Track import is next</h2>
          <p className="mt-3 text-white/45">
            In the next sprint we connect this screen to your real releases.
          </p>
        </div>

        <button
          type="button"
          onClick={finishSetup}
          className="mt-8 rounded-2xl bg-emerald-400 px-8 py-4 font-black text-black transition hover:bg-emerald-300"
        >
          Go to Dashboard →
        </button>
      </section>
    </main>
  );
}