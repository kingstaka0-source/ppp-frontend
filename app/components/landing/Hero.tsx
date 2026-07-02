import DemoVideoButton from "./DemoVideoButton";
import HeroDashboard from "./HeroDashboard";

type HeroProps = {
  artistId: string;
};

export default function Hero({ artistId }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-20 px-6 py-24 lg:grid-cols-2">

        {/* LEFT */}

        <div>

        </div>

        {/* RIGHT */}

        <HeroDashboard />

      </div>
    </section>
  );
}