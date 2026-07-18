"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function OnboardingWizardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const firstName =
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Artist";

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading TuneReach...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <div className="text-xl font-black tracking-tight">
            Tune<span className="text-emerald-400">Reach</span>
          </div>

          <div className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70">
            Step 1 of 3
          </div>
        </header>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 rounded-full bg-emerald-400" />
        </div>

        <section className="mt-10 grid min-h-[680px] overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-950 to-emerald-950 shadow-2xl lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col justify-center px-8 py-14 sm:px-14 lg:px-16">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
              ✨ Your artist journey starts here
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl">
              Welcome, {firstName}.
              <span className="block text-emerald-400">
                Let&apos;s grow your music.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
              Connect your Spotify artist profile, import your first release
              and discover playlists that match your sound.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              <FeatureCard
                icon="🎧"
                title="Connect Spotify"
                description="Link your artist profile securely."
              />

              <FeatureCard
                icon="📀"
                title="Import a track"
                description="Choose the release you want to promote."
              />

              <FeatureCard
                icon="🚀"
                title="Start pitching"
                description="Generate matches and launch your campaign."
              />
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => router.push("/onboarding/spotify")}
                className="rounded-2xl bg-emerald-400 px-7 py-4 text-base font-black text-black transition hover:bg-emerald-300"
              >
                Start setup →
              </button>

              <p className="text-sm text-white/45">
                Takes about 2 minutes. No credit card required.
              </p>
            </div>
          </div>

          <div className="relative hidden min-h-full border-l border-white/10 bg-white/[0.025] lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.24),transparent_42%)]" />

            <div className="relative flex h-full items-center justify-center p-12">
              <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/45">Your first campaign</p>
                    <h2 className="mt-1 text-2xl font-black">
                      Ready in minutes
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-2xl">
                    🚀
                  </div>
                </div>

                <div className="mt-8 space-y-5">
                  <ProgressItem
                    number="01"
                    title="Spotify profile"
                    text="Connect your official artist account"
                  />

                  <ProgressItem
                    number="02"
                    title="Select release"
                    text="Choose your newest or strongest track"
                  />

                  <ProgressItem
                    number="03"
                    title="Playlist discovery"
                    text="TuneReach finds relevant opportunities"
                  />
                </div>

                <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <p className="text-sm font-semibold text-emerald-300">
                    Your dashboard is ready
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/55">
                    Complete setup to activate your first track and campaign.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="text-2xl">{icon}</div>
      <h2 className="mt-4 font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/50">{description}</p>
    </div>
  );
}

function ProgressItem({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-bold text-emerald-300">
        {number}
      </div>

      <div>
        <p className="font-bold">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/45">{text}</p>
      </div>
    </div>
  );
}