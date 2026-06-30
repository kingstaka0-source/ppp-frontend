import Link from "next/link";

export const dynamic = "force-dynamic";

const artistId = "cmmnjti0n0004112o3orl713x";

const stats = [
  ["25,000+", "Curator Contacts"],
  ["1,500+", "Playlists Indexed"],
  ["50,000+", "AI Pitches Generated"],
  ["100+", "Artists Growing"],
];

const steps = [
  ["1", "Import Track", "Add your Spotify track URL in seconds."],
  ["2", "Find Playlists", "AI matches your track with relevant playlists."],
  ["3", "Generate Pitches", "Create personalized curator outreach."],
  ["4", "Launch Campaign", "Send pitches and automate your outreach."],
  ["5", "Follow-ups", "Reach engaged curators again at the right moment."],
  ["6", "Track Results", "Monitor opens, clicks, replies and placements."],
];

const features = [
  [
    "🎯",
    "AI Playlist Matching",
    "Match your music with playlists based on genre, mood, energy and audience fit.",
  ],
  [
    "🤖",
    "AI Pitch Generator",
    "Create personalized curator pitches faster without sounding generic.",
  ],
  [
    "🚀",
    "Campaign Automation",
    "Launch outreach campaigns and keep every curator interaction organized.",
  ],
  [
    "👥",
    "Curator CRM",
    "Manage curator contacts, conversations, engagement and campaign history.",
  ],
  [
    "📈",
    "Campaign Analytics",
    "Track opens, clicks, replies, placements and campaign performance.",
  ],
  [
    "✅",
    "Placement Detection",
    "See when your track gets added to playlists and measure real outcomes.",
  ],
];

const liveStats = [
  ["Matches", "28", "↗ 4 new"],
  ["Sent", "315", "↗ 12 today"],
  ["Opens", "76", "↗ 9 today"],
  ["Open Rate", "24%", "↗ 6%"],
];

const campaignActivity = [
  ["🚀", "Pitch sent to Tropical Vibes", "2m ago"],
  ["✉️", "Email opened", "6m ago"],
  ["🔗", "Spotify link clicked", "8m ago"],
  ["💬", "Reply received", "12m ago"],
];

const faqs = [
  [
    "Does TuneReach guarantee playlist placements?",
    "No. TuneReach helps you find relevant curators and improve outreach, but placements always depend on the curator.",
  ],
  [
    "Can I use my own Spotify releases?",
    "Yes. Import any Spotify track and start matching it with relevant playlist opportunities.",
  ],
  [
    "Is there a free plan?",
    "Yes. The Free plan lets you test TuneReach before upgrading to Pro.",
  ],
  [
    "Can I cancel anytime?",
    "Yes. You can manage or cancel your subscription anytime through Stripe.",
  ],
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.35),transparent_35%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_30%),linear-gradient(to_bottom,rgba(0,0,0,0.15),#000)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-2xl font-black tracking-tight">
              <span className="text-green-400">▮▮▮</span>
              <span>
                Tune<span className="text-green-400">Reach</span>
              </span>
            </div>

            <div className="hidden items-center gap-8 text-sm font-semibold text-white/80 md:flex">
              <a href="#features" className="hover:text-green-300">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-green-300">
                How It Works
              </a>
              <a href="#pricing" className="hover:text-green-300">
                Pricing
              </a>
              <a href="#faq" className="hover:text-green-300">
                FAQ
              </a>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/dashboard?artistId=${artistId}`}
                className="rounded-full border border-white/20 px-5 py-2 text-sm font-bold hover:bg-white hover:text-black transition"
              >
                Login
              </Link>

              <Link
                href={`/upgrade?artistId=${artistId}`}
                className="rounded-full bg-green-500 px-5 py-2 text-sm font-black text-black hover:bg-green-400 transition"
              >
                Start Free Trial
              </Link>
            </div>
          </nav>

          <div className="grid min-h-[720px] gap-12 py-20 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-6 inline-flex rounded-full border border-green-400/40 bg-green-400/10 px-4 py-2 text-sm font-bold uppercase tracking-wide text-green-300">
                ✨ AI-powered playlist promotion
              </div>

              <h1 className="max-w-4xl text-5xl font-black leading-tight md:text-7xl">
                Grow Your Spotify Streams With{" "}
                <span className="text-green-400">AI-Powered</span> Playlist
                Promotion
              </h1>

              <p className="mt-6 max-w-2xl text-xl leading-8 text-white/70">
                Discover playlist opportunities, generate personalized curator
                outreach, automate follow-ups and track every campaign from one
                powerful dashboard.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href={`/upgrade?artistId=${artistId}`}
                  className="rounded-full bg-green-500 px-8 py-4 font-black text-black hover:bg-green-400 transition"
                >
                  Start Free Trial →
                </Link>

                <a
                  href="#how-it-works"
                  className="rounded-full border border-white/25 px-8 py-4 font-black hover:bg-white hover:text-black transition"
                >
                  ▶ Watch Demo
                </a>
              </div>

              <div className="mt-7 flex flex-wrap gap-5 text-sm text-white/60">
                <span>✓ No credit card required</span>
                <span>✓ 7-day free trial</span>
                <span>✓ Cancel anytime</span>
              </div>
            </div>

            {/* LIVE DASHBOARD MOCKUP */}
<div className="relative">
  <div className="absolute -inset-8 rounded-full bg-green-500/20 blur-3xl" />

  <div className="relative rounded-[2rem] border border-green-400/40 bg-black/70 p-5 shadow-[0_0_80px_rgba(34,197,94,0.25)] backdrop-blur">
    <div className="mb-5 flex items-center justify-between">
      <div>
        <div className="text-sm text-white/40">Campaign</div>
        <div className="text-2xl font-black">Island Sunset</div>
      </div>

      <div className="rounded-full bg-green-500 px-4 py-1 text-xs font-black text-black">
        PRO
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {liveStats.map(([label, value, change]) => (
        <div
          key={label}
          className="rounded-2xl border border-white/10 bg-white/5 p-4 transition duration-500 hover:-translate-y-1 hover:border-green-400/40 hover:bg-green-400/10"
        >
          <div className="text-xs uppercase text-white/45">{label}</div>
          <div className="mt-3 text-3xl font-black">{value}</div>
          <div className="mt-2 text-xs font-bold text-green-400">
            {change}
          </div>
        </div>
      ))}
    </div>

    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 text-sm font-bold text-white">
          Campaign Performance
        </div>

        <div className="relative h-36 overflow-hidden rounded-xl border border-green-400/20 bg-black/40">
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-green-500/30 to-transparent" />

          <svg
            viewBox="0 0 400 140"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
          >
            <polyline
            className="animate-pulse"
              points="0,105 45,75 90,88 135,55 180,82 225,45 270,63 315,38 360,48 400,22"
              fill="none"
              stroke="rgb(34,197,94)"
              strokeWidth="4"
            />
            <circle cx="400" cy="22" r="5" fill="rgb(34,197,94)" />
          </svg>

          <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[10px] text-white/40">
            <span>May 9</span>
            <span>May 10</span>
            <span>May 11</span>
            <span>May 12</span>
            <span>May 13</span>
            <span>May 14</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 text-sm font-bold text-white">
          Top Playlist Genres
        </div>

        <div className="flex items-center gap-5">
          <div className="relative h-28 w-28 rounded-full bg-[conic-gradient(rgb(34,197,94)_0_40%,rgba(34,197,94,0.65)_40%_70%,rgba(34,197,94,0.35)_70%_90%,rgba(34,197,94,0.18)_90%_100%)]">
            <div className="absolute inset-7 rounded-full bg-black" />
          </div>

          <div className="flex-1 space-y-3 text-sm">
            {[
              ["Reggae", "40%"],
              ["Dancehall", "30%"],
              ["Afrobeats", "20%"],
              ["Hip Hop", "10%"],
            ].map(([genre, percent]) => (
              <div key={genre} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-white/70">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  {genre}
                </span>
                <span className="text-white/50">{percent}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-green-400/30 bg-green-400/10 p-5">
        <div className="text-sm font-bold text-green-300">
          AI Pitch Preview
        </div>

        <p className="mt-3 min-h-[96px] text-sm leading-6 text-white/75">
          Hi, I came across your playlist and thought this track could fit
          naturally with the vibe you&apos;re curating. The energy and mood
          match really well with your selection...
          <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-green-400 align-middle" />
        </p>

        <div className="mt-4 border-t border-white/10 pt-3 text-xs text-green-300">
          ✨ AI is generating a personalized pitch...
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-bold text-white">
            Campaign Activity
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-green-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            Live
          </div>
        </div>

        <div className="space-y-3">
          {campaignActivity.map(([icon, text, time]) => (
            <div
              key={text}
              className="flex items-center justify-between rounded-xl bg-black/40 px-3 py-2 text-sm transition duration-500 hover:bg-green-400/10"
            >
              <span className="flex items-center gap-2 text-white/75">
                <span>{icon}</span>
                {text}
              </span>
              <span className="text-xs text-white/40">{time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>
</div>

          {/* TRUST / STATS */}
          <div className="grid gap-4 pb-20 lg:grid-cols-[1fr_1.4fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-center text-xs font-bold uppercase tracking-widest text-white/50">
                Trusted by artists working on
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-6 text-lg font-black text-white/80">
                <span>Spotify</span>
                <span>Apple Music</span>
                <span>Deezer</span>
                <span>YouTube Music</span>
              </div>
            </div>

            <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(([value, label]) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-black text-green-400">
                    {value}
                  </div>
                  <div className="mt-1 text-sm text-white/60">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-black md:text-5xl">
            How TuneReach Works
          </h2>
          <p className="mt-4 text-lg text-white/60">
            From track upload to playlist outreach in minutes.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {steps.map(([num, title, text]) => (
            <div
              key={num}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center"
            >
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 font-black text-black">
                {num}
              </div>
              <h3 className="font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-y border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-12">
            <h2 className="text-4xl font-black md:text-5xl">
              Everything you need to pitch smarter
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-white/60">
              TuneReach combines playlist matching, AI outreach, CRM, follow-ups
              and analytics in one workflow.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(([icon, title, text]) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-black p-8"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/15 text-2xl">
                  {icon}
                </div>
                <h3 className="text-2xl font-black">{title}</h3>
                <p className="mt-4 leading-7 text-white/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black md:text-5xl">
            Simple pricing for serious artists
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Start free. Upgrade when you are ready to scale.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-3xl font-black">Free</h3>
            <p className="mt-3 text-white/60">For testing the platform.</p>
            <div className="mt-8 text-5xl font-black">€0</div>
            <ul className="mt-8 space-y-4 text-white/70">
              <li>✓ 3 pitches per month</li>
              <li>✓ Track matching</li>
              <li>✓ Basic dashboard</li>
            </ul>
          </div>

          <div className="relative rounded-3xl border border-green-300 bg-green-500 p-8 text-black shadow-[0_0_60px_rgba(34,197,94,0.25)]">
            <div className="absolute right-6 top-6 rounded-full bg-black px-4 py-1 text-xs font-black text-white">
              Most Popular
            </div>

            <h3 className="text-3xl font-black">PRO</h3>
            <p className="mt-3 text-black/70">
              For artists ready to pitch seriously.
            </p>
            <div className="mt-8 text-5xl font-black">€19/mo</div>

            <ul className="mt-8 space-y-4 text-black/80">
              <li>✓ Unlimited pitches</li>
              <li>✓ Campaign launch</li>
              <li>✓ Email intelligence</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Follow-up automation</li>
              <li>✓ Curator CRM</li>
              <li>✓ Open & click tracking</li>
              <li>✓ Placement detection</li>
            </ul>

            <Link
              href={`/upgrade?artistId=${artistId}`}
              className="mt-8 inline-block rounded-full bg-black px-8 py-4 font-black text-white"
            >
              Upgrade to PRO →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="mb-10 text-center text-4xl font-black">
          Frequently Asked Questions
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <div key={question} className="rounded-3xl border border-white/10 p-6">
              <h3 className="font-black">{question}</h3>
              <p className="mt-3 leading-7 text-white/60">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24 text-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
          <h2 className="text-4xl font-black md:text-5xl">
            Ready to reach more playlist curators?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/60">
            Join independent artists using TuneReach to turn playlist pitching
            into a repeatable campaign system.
          </p>

          <Link
            href={`/upgrade?artistId=${artistId}`}
            className="mt-10 inline-block rounded-full bg-green-500 px-10 py-5 font-black text-black hover:bg-green-400 transition"
          >
            Start Your Free Trial →
          </Link>

          <div className="mt-5 text-sm text-white/50">
            No credit card required • 7-day free trial • Cancel anytime
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-sm text-white/45 md:flex-row">
          <div className="font-black text-white">
            Tune<span className="text-green-400">Reach</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white">
              Terms of Service
            </a>
            <a href="mailto:support@tunereach.app" className="hover:text-white">
              Contact
            </a>
            <a href="mailto:support@tunereach.app" className="hover:text-white">
              Support
            </a>
          </div>

          <div>© {new Date().getFullYear()} TuneReach.</div>
        </div>
      </footer>
    </main>
  );
}