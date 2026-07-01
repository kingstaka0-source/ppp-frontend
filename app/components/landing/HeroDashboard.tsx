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

export default function HeroDashboard() {
  return (
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
                  <div
                    key={genre}
                    className="flex items-center justify-between"
                  >
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
  );
}