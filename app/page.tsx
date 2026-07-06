import Link from "next/link";
import HeroDashboard from "./components/landing/HeroDashboard";
import DemoVideoButton from "./components/landing/DemoVideoButton";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TuneReach | AI-Powered Playlist Promotion",
  description:
    "TuneReach helps independent artists find playlist opportunities, generate personalized AI pitches, automate curator outreach and track campaign results.",
  openGraph: {
    title: "TuneReach | AI-Powered Playlist Promotion",
    description:
      "Find playlists, generate AI pitches, launch campaigns and track results from one dashboard.",
    url: "https://tunereach.app",
    siteName: "TuneReach",
    images: [
      {
        url: "/hero-artist.png",
        width: 1200,
        height: 630,
        alt: "TuneReach AI-powered playlist promotion dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TuneReach | AI-Powered Playlist Promotion",
    description:
      "AI playlist matching, curator outreach automation and campaign analytics for independent artists.",
    images: ["/hero-artist.png"],
  },
};

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
    <div className="flex h-8 items-center gap-1">
      <span className="h-4 w-2 rounded-full bg-green-400" />
      <span className="h-7 w-2 rounded-full bg-green-400" />
      <span className="h-9 w-2 rounded-full bg-green-400" />
      <span className="h-7 w-2 rounded-full bg-green-400" />
      <span className="h-4 w-2 rounded-full bg-green-400" />
    </div>

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
      className="rounded-full border border-white/20 px-5 py-2 text-sm font-bold transition hover:bg-white hover:text-black"
    >
      Login
    </Link>

    <Link
      href={`/upgrade?artistId=${artistId}`}
      className="rounded-full bg-green-500 px-5 py-2 text-sm font-black text-black transition hover:bg-green-400"
    >
      Start Free Trial
    </Link>
  </div>
</nav>

          <div className="grid min-h-[720px] gap-12 py-20 lg:grid-cols-2 lg:items-center">
            
              <div className="relative rounded-[2rem] min-h-[760px] overflow-hidden">
  <div
  className="absolute -right-40 inset-y-20 left-0 opacity-95"
  style={{
  backgroundImage: "url('/hero-artist.png')",
  backgroundSize: "cover",
  backgroundPosition: "78% center",
  transform: "scale(1.08)",
}}
/>

<div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
<div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20" />
<div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

  <div className="relative z-10 max-w-xl px-8 py-16 lg:px-12 lg:py-24">

              <h1 className="max-w-3xl text-6xl font-black leading-[0.95] tracking-tight md:text-7xl">
  Grow Your
  <br />
  Spotify Career
  <br />
  With{" "}
  <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent">
    AI
  </span>
</h1> 

              <p className="mt-8 max-w-2xl text-xl leading-9 text-white/70">
  TuneReach finds playlist opportunities, writes personalized AI pitches,
  contacts curators automatically and helps independent artists grow faster
  with less work.
</p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href={`/upgrade?artistId=${artistId}`}
                  className="rounded-full bg-green-500 px-8 py-4 font-black text-black hover:bg-green-400 transition"
                >
                  Start Free Trial →
                </Link>

                <DemoVideoButton />
              </div>

              <div className="mt-8 flex flex-wrap gap-6 text-sm font-medium text-white/60">
  <span>✓ Free plan available</span>
  <span>✓ 7-day Pro trial</span>
  <span>✓ Secure payments by Stripe</span>
</div>

  </div>
</div>

<div className="relative z-20">
  <HeroDashboard />
</div>

          {/* TRUST / STATS */}
<div className="grid gap-6 pb-20 xl:grid-cols-[0.8fr_1.6fr]">
  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
    <div className="text-xs font-bold uppercase tracking-widest text-white/50">
      Trusted by artists working on
    </div>

    <div className="mt-5 grid grid-cols-2 gap-4 text-base font-black text-white/80">
      <span>Spotify</span>
      <span>Apple Music</span>
      <span>Deezer</span>
      <span>YouTube Music</span>
    </div>
  </div>

  <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {stats.map(([value, label]) => (
        <div
          key={label}
          className="min-w-0 text-center"
        >
          <div className="whitespace-nowrap text-2xl font-black text-green-400 lg:text-3xl">
            {value}
          </div>

          <div className="mt-2 text-xs leading-5 text-white/60">
            {label}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

</div>
</div>
</section>

      {/* HOW IT WORKS */}
<section id="how-it-works" className="mx-auto max-w-7xl px-6 py-28">
  <div className="mb-16 text-center">
    <div className="text-sm font-black uppercase tracking-[0.3em] text-green-400">
      How it works
    </div>

    <h2 className="mt-4 text-5xl font-black">
      From Spotify track to curator outreach
    </h2>

    <p className="mx-auto mt-6 max-w-3xl text-xl text-white/60">
      TuneReach turns playlist pitching into a clear step-by-step campaign workflow.
    </p>
  </div>

  <div className="grid gap-6 lg:grid-cols-3">
    {[
      ["01", "Import your track", "Paste a Spotify track URL and TuneReach prepares your campaign."],
      ["02", "Find matching playlists", "AI scans playlist opportunities based on sound, genre and audience fit."],
      ["03", "Generate outreach", "Create personalized curator pitches instead of generic copy-paste emails."],
      ["04", "Launch campaign", "Send outreach, track engagement and manage curator responses from one place."],
      ["05", "Automate follow-ups", "Reach engaged curators again without manually chasing every reply."],
      ["06", "Track results", "Measure opens, clicks, replies, placements and campaign performance."],
    ].map(([number, title, text]) => (
      <div
        key={number}
        className="group rounded-3xl border border-white/10 bg-white/5 p-8 transition duration-500 hover:-translate-y-2 hover:border-green-400/40 hover:bg-green-400/10"
      >
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500 text-xl font-black text-black">
          {number}
        </div>

        <h3 className="text-2xl font-black">{title}</h3>

        <p className="mt-4 leading-7 text-white/60">{text}</p>
      </div>
    ))}
  </div>
</section>

      {/* TESTIMONIALS */}
<section className="mx-auto max-w-7xl px-6 py-24">
  <div className="mb-12 text-center">
    <div className="text-sm font-black uppercase tracking-widest text-green-400">
      Artist results
    </div>

    <h2 className="mt-4 text-4xl font-black md:text-5xl">
      Built for artists who pitch seriously
    </h2>

    <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
      TuneReach helps artists turn playlist outreach into a repeatable,
      trackable growth system.
    </p>
  </div>

  <div className="grid gap-6 md:grid-cols-3">
    {[
      [
        "King Staka",
        "Reggae artist & drummer",
        "TuneReach makes playlist pitching feel organized instead of random. I can see matches, campaigns, opens and results in one place.",
        "315 pitches sent",
      ],
      [
        "Independent Artist",
        "Afrobeats / Dancehall",
        "The AI workflow helps me move faster without sending the same generic message to every curator.",
        "28 playlist matches",
      ],
      [
        "Artist Manager",
        "Campaign workflow",
        "The dashboard gives me a clear view of outreach, follow-ups and curator engagement before I spend more time chasing replies.",
        "24% open rate",
      ],
    ].map(([name, role, quote, metric]) => (
      <div
        key={name}
        className="rounded-3xl border border-white/10 bg-white/5 p-8 transition hover:-translate-y-1 hover:border-green-400/30 hover:bg-green-400/10"
      >
        <div className="mb-6 text-5xl text-green-400">“</div>

        <p className="min-h-[140px] leading-7 text-white/70">
          {quote}
        </p>

        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="font-black text-white">{name}</div>
          <div className="mt-1 text-sm text-white/45">{role}</div>

          <div className="mt-5 inline-flex rounded-full border border-green-400/30 bg-green-400/10 px-4 py-2 text-sm font-bold text-green-300">
            {metric}
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

{/* USE CASES */}
<section className="mx-auto max-w-7xl px-6 py-24">
  <div className="mb-14 text-center">
    <div className="text-sm font-black uppercase tracking-widest text-green-400">
      Use Cases
    </div>

    <h2 className="mt-4 text-4xl font-black md:text-5xl">
      Built for every music professional
    </h2>

    <p className="mx-auto mt-4 max-w-3xl text-lg text-white/60">
      Whether you're growing your own career, managing artists or running a
      label, TuneReach helps you automate playlist promotion and scale your
      outreach.
    </p>
  </div>

  <div className="grid gap-8 lg:grid-cols-3">
    {[
      {
        icon: "🎤",
        title: "Independent Artist",
        items: [
          "Upload your tracks",
          "Generate AI pitches",
          "Reach playlist curators",
          "Grow your audience",
        ],
        button: "Perfect for solo artists →",
      },
      {
        icon: "🎵",
        title: "Record Label",
        items: [
          "Manage multiple artists",
          "Launch campaigns",
          "Track performance",
          "Scale outreach",
        ],
        button: "Perfect for labels →",
      },
      {
        icon: "👥",
        title: "Artist Manager",
        items: [
          "Organize campaigns",
          "Follow up automatically",
          "Track replies",
          "Measure growth",
        ],
        button: "Perfect for managers →",
      },
    ].map((card) => (
      <div
        key={card.title}
        className="group rounded-3xl border border-white/10 bg-white/5 p-8 transition duration-500 hover:-translate-y-2 hover:border-green-400/40 hover:bg-green-400/10"
      >
        <div className="mb-6 text-5xl">{card.icon}</div>

        <h3 className="text-2xl font-black">{card.title}</h3>

        <div className="mt-8 space-y-4">
          {card.items.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 text-white/70"
            >
              <span className="text-green-400">✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <button
          className="mt-10 w-full rounded-full border border-green-400/30 bg-green-400/10 py-4 font-black text-green-300 transition duration-300 group-hover:bg-green-500 group-hover:text-black"
        >
          {card.button}
        </button>
      </div>
    ))}
  </div>
</section>

      {/* FEATURES */}
<section id="features" className="mx-auto max-w-7xl px-6 py-24">
  <div className="mb-16 text-center">
    <div className="text-sm font-black uppercase tracking-widest text-green-400">
      Features
    </div>

    <h2 className="mt-4 text-4xl font-black md:text-5xl">
      Everything you need to grow
    </h2>

    <p className="mx-auto mt-5 max-w-3xl text-lg text-white/60">
      TuneReach combines AI, playlist discovery, outreach automation and
      campaign analytics into one powerful platform.
    </p>
  </div>

  <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
    {[
      {
        icon: "🎯",
        title: "AI Playlist Matching",
        text: "Find playlists that actually fit your music using intelligent matching.",
      },
      {
        icon: "🤖",
        title: "AI Pitch Writing",
        text: "Generate unique curator emails that sound natural and personal.",
      },
      {
        icon: "📧",
        title: "Campaign Automation",
        text: "Send pitches automatically and manage outreach from one dashboard.",
      },
      {
        icon: "📈",
        title: "Analytics",
        text: "Track opens, clicks, replies and campaign performance in real time.",
      },
      {
        icon: "📬",
        title: "Follow-up System",
        text: "Automatically remind curators without sending duplicate emails.",
      },
      {
        icon: "⚡",
        title: "Growth Dashboard",
        text: "See every campaign, every playlist and every result in one place.",
      },
    ].map((feature) => (
      <div
        key={feature.title}
        className="group rounded-3xl border border-white/10 bg-white/5 p-8 transition duration-500 hover:-translate-y-2 hover:border-green-400/40 hover:bg-green-400/10"
      >
        <div className="mb-6 text-5xl transition duration-300 group-hover:scale-110">
          {feature.icon}
        </div>

        <h3 className="text-2xl font-black">{feature.title}</h3>

        <p className="mt-5 leading-7 text-white/60">
          {feature.text}
        </p>
      </div>
    ))}
  </div>
</section>

      {/* PRICING */}
<section id="pricing" className="mx-auto max-w-7xl px-6 py-28">

  <div className="text-center">
    <div className="text-sm font-black uppercase tracking-[0.3em] text-green-400">
      Pricing
    </div>

    <h2 className="mt-4 text-5xl font-black">
      Simple pricing that grows with you
    </h2>

    <p className="mx-auto mt-6 max-w-3xl text-xl text-white/60">
      Start for free. Upgrade only when you're ready to automate your
      playlist promotion.
    </p>
  </div>

  <div className="mt-20 grid gap-8 lg:grid-cols-3">

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

  <div className="text-sm font-bold uppercase text-white/40">
    Free
  </div>

  <div className="mt-4 text-5xl font-black">
    €0
  </div>

  <div className="mt-1 text-white/50">
    forever
  </div>

  <div className="mt-8 space-y-4 text-white/80">
    <div>✓ 3 AI pitches / month</div>
    <div>✓ Playlist Matching</div>
    <div>✓ Dashboard</div>
    <div>✓ Basic Analytics</div>
  </div>

  <Link
    href={`/dashboard?artistId=${artistId}`}
    className="mt-10 block rounded-full border border-white/20 py-4 text-center font-black transition hover:bg-white hover:text-black"
  >
    Start Free
  </Link>

</div>

<div className="relative scale-105 rounded-3xl border border-green-400 bg-green-500/10 p-8 shadow-[0_0_80px_rgba(34,197,94,.25)]">

  <div className="absolute right-6 top-6 rounded-full bg-green-500 px-4 py-1 text-xs font-black text-black">
    MOST POPULAR
  </div>

  <div className="text-sm font-bold uppercase text-green-400">
    Pro
  </div>

  <div className="mt-4 flex items-end gap-2">
    <div className="text-6xl font-black">
      €19
    </div>

    <div className="pb-2 text-white/50">
      /month
    </div>
  </div>

  <div className="mt-8 space-y-4 text-white">
    <div>✓ Unlimited AI Pitches</div>
    <div>✓ Unlimited Campaigns</div>
    <div>✓ Email Automation</div>
    <div>✓ Open & Click Tracking</div>
    <div>✓ Follow-ups</div>
    <div>✓ Priority Support</div>
  </div>

  <Link
    href={`/upgrade?artistId=${artistId}`}
    className="mt-10 block rounded-full bg-green-500 py-4 text-center font-black text-black transition hover:scale-105 hover:bg-green-400"
  >
    Start 7-Day Trial
  </Link>

</div>

<div className="rounded-3xl border border-white/10 bg-white/5 p-8">

  <div className="text-sm font-bold uppercase text-white/40">
    Enterprise
  </div>

  <div className="mt-4 text-4xl font-black">
    Custom
  </div>

  <div className="mt-1 text-white/50">
    For Labels & Teams
  </div>

  <div className="mt-8 space-y-4 text-white/80">
    <div>✓ Unlimited Artists</div>
    <div>✓ Team Members</div>
    <div>✓ Shared Dashboard</div>
    <div>✓ API Access</div>
    <div>✓ Dedicated Support</div>
  </div>

  <a
    href="mailto:support@tunereach.app"
    className="mt-10 block rounded-full border border-white/20 py-4 text-center font-black transition hover:bg-white hover:text-black"
  >
    Contact Sales
  </a>

</div>
  </div>
  <div className="mt-16 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
  <div className="grid grid-cols-3 border-b border-white/10 bg-white/5 px-6 py-5 font-black">
    <div>Feature</div>
    <div className="text-center">Free</div>
    <div className="text-center text-green-400">Pro</div>
  </div>

  {[
    ["AI pitches", "3 / month", "Unlimited"],
    ["Playlist matching", "✓", "✓"],
    ["Campaign launch", "—", "✓"],
    ["Email automation", "—", "✓"],
    ["Open & click tracking", "—", "✓"],
    ["Follow-ups", "—", "✓"],
    ["Curator CRM", "Basic", "Advanced"],
    ["Analytics", "Basic", "Advanced"],
    ["Support", "Community", "Priority"],
  ].map(([feature, free, pro]) => (
    <div
      key={feature}
      className="grid grid-cols-3 border-b border-white/10 px-6 py-5 text-white/70 last:border-b-0"
    >
      <div className="font-semibold text-white">{feature}</div>
      <div className="text-center">{free}</div>
      <div className="text-center font-bold text-green-400">{pro}</div>
    </div>
  ))}
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
            Start Your 7-Day Pro Trial →
          </Link>

          <div className="mt-5 text-sm text-white/50">
  Free plan available • 7-day Pro trial • Secure payments by Stripe
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