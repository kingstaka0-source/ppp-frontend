import Link from "next/link";

export const dynamic = "force-dynamic";

const artistId = "cmmnjti0n0004112o3orl713x";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.35),transparent_35%),linear-gradient(to_bottom,rgba(0,0,0,0.35),#000)]" />

        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <nav className="mb-20 flex items-center justify-between">
            <div className="text-2xl font-black tracking-tight">
              TuneReach
            </div>

            <div className="flex gap-3">
              <Link
                href={`/dashboard?artistId=${artistId}`}
                className="rounded-full border border-white/30 px-5 py-2 text-sm hover:bg-white hover:text-black transition"
              >
                Login
              </Link>

              <Link
                href={`/upgrade?artistId=${artistId}`}
                className="rounded-full bg-green-500 px-5 py-2 text-sm font-bold text-black hover:bg-green-400 transition"
              >
                Start Free Trial
              </Link>
            </div>
          </nav>

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-5 inline-flex rounded-full border border-green-400/40 bg-green-400/10 px-4 py-2 text-sm text-green-300">
                AI playlist pitching for independent artists
              </div>

              <h1 className="max-w-3xl text-5xl font-black leading-tight md:text-7xl">
                Get your music heard by the right Spotify playlist curators.
              </h1>

              <p className="mt-6 max-w-2xl text-xl leading-8 text-white/70">
                Find playlist opportunities, generate AI-powered curator pitches,
launch campaigns, and track opens, clicks and placements from one dashboard.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href={`/dashboard?artistId=${artistId}`}
                  className="rounded-full bg-green-500 px-8 py-4 font-bold text-black hover:bg-green-400 transition"
                >
                  Open Dashboard
                </Link>

                <Link
                  href="#how-it-works"
                  className="rounded-full border border-white/30 px-8 py-4 font-bold hover:bg-white hover:text-black transition"
                >
                  See How It Works
                </Link>
              </div>

              <div className="mt-8 text-sm text-white/50">
  Trusted by independent artists, reggae musicians,
  producers and playlist marketers.
</div>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 text-center">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-3xl font-black">1.5k+</div>
                  <div className="mt-1 text-xs text-white/60">Playlists</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-3xl font-black">500+</div>
                  <div className="mt-1 text-xs text-white/60">Matches</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-3xl font-black">300+</div>
                  <div className="mt-1 text-xs text-white/60">Pitches</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
              <div className="rounded-2xl bg-black/70 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/50">Campaign</div>
                    <div className="text-xl font-bold">Cocoa Tea</div>
                  </div>
                  <div className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-black">
                    PRO
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Matches", "28"],
                    ["Sent", "315"],
                    ["Drafts", "53"],
                    ["Open Rate", "0%"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="text-xs uppercase text-white/50">
                        {label}
                      </div>
                      <div className="mt-2 text-3xl font-black">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-green-400/30 bg-green-400/10 p-4">
                  <div className="text-sm text-green-300">
                    AI Pitch Preview
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/75">
                    Hi, I came across your playlist and thought this track could
                    fit naturally with the sound you are curating...
                  </p>
                </div>

                <button className="mt-5 w-full rounded-xl bg-green-500 py-4 font-bold text-black">
                  Launch Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-4xl font-black">How TuneReach works</h2>
          <p className="mt-4 text-white/60">
            From track upload to curator outreach in minutes.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          {[
            ["1", "Import your track", "Add your Spotify track URL."],
            ["2", "Find playlists", "Match against relevant playlists."],
            ["3", "Generate pitches", "Create personalized AI outreach."],
            ["4", "Launch campaign", "Send, track and optimize results."],
          ].map(([num, title, text]) => (
            <div
              key={num}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 font-black text-black">
                {num}
              </div>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/5">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-24 md:grid-cols-3">
          {[
            [
              "Playlist Matching",
              "Find playlists that fit your track based on genre, mood, energy and audience.",
            ],
            [
              "AI Pitch Generator",
              "Write personal curator pitches faster without sounding generic.",
            ],
            [
              "Campaign Analytics",
              "Track sent pitches, clicks, opens, replies and campaign history.",
            ],
            [
  "Follow-up Automation",
  "Automatically identify engaged curators and send strategic follow-ups.",
]
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl bg-black p-8">
              <h3 className="text-2xl font-black">{title}</h3>
              <p className="mt-4 leading-7 text-white/60">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-3xl font-black">Free</h3>
            <p className="mt-3 text-white/60">For testing the platform.</p>
            <div className="mt-8 text-5xl font-black">€0</div>
            <ul className="mt-8 space-y-3 text-white/70">
              <li>3 pitches per month</li>
              <li>Track matching</li>
              <li>Basic dashboard</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-green-400 bg-green-500 p-8 text-black">
            <h3 className="text-3xl font-black">PRO</h3>
            <p className="mt-3 text-black/70">
              For artists ready to pitch seriously.
            </p>
            <div className="mt-8 text-5xl font-black">€19/mo</div>
            <ul className="mt-8 space-y-3 text-black/80">
              <li>Unlimited pitches</li>
              <li>Campaign launch</li>
              <li>Email intelligence</li>
              <li>Advanced analytics</li>
              <li>Follow-up automation</li>
              <li>Curator CRM</li>
              <li>Open & click tracking</li>
              <li>Placement detection</li>
            </ul>

            <Link
              href={`/upgrade?artistId=${artistId}`}
              className="mt-8 inline-block rounded-full bg-black px-8 py-4 font-bold text-white"
            >
              Upgrade to PRO
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <h2 className="text-5xl font-black">
          Ready to reach more playlist curators?
        </h2>
        <p className="mt-5 text-xl text-white/60">
          Start with TuneReach and turn playlist pitching into a repeatable
          campaign system.
        </p>

        <Link
          href={`/dashboard?artistId=${artistId}`}
          className="mt-10 inline-block rounded-full bg-green-500 px-10 py-5 font-black text-black hover:bg-green-400 transition"
        >
          Start Now
        </Link>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/40">
        © {new Date().getFullYear()} TuneReach. Built for independent artists.
      </footer>
    </main>
  );
}