import { auth, currentUser } from "@clerk/nextjs/server";
import ContinueButton from "./ContinueButton";
import { redirect } from "next/navigation";


export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  const firstName = user?.firstName?.trim() || "Artist";

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="text-sm font-black uppercase tracking-[0.3em] text-green-400">
          Welcome to TuneReach
        </div>

        <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight">
          Welcome, {firstName}. Let&apos;s launch your first campaign.
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">
          Your account is ready. We will now create your TuneReach artist
          profile and help you import your first Spotify track.
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-green-500/40 bg-green-500/10 p-7">
            <div className="text-sm font-black text-green-400">STEP 1</div>
            <h2 className="mt-3 text-xl font-black">Create artist profile</h2>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Connect this account to your private TuneReach artist profile.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <div className="text-sm font-black text-white/40">STEP 2</div>
            <h2 className="mt-3 text-xl font-black">Import your track</h2>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Add your Spotify release and start playlist matching.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <div className="text-sm font-black text-white/40">STEP 3</div>
            <h2 className="mt-3 text-xl font-black">Generate your pitch</h2>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Create your first personalized AI curator pitch.
            </p>
          </div>
        </div>

        <div className="mt-10">
  <ContinueButton />
</div>
      </div>
    </main>
  );
}