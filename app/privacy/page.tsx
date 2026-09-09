import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | TuneReach",
  description:
    "Privacy Policy explaining how TuneReach collects, uses and protects personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-green-400 hover:text-green-300"
        >
          ← Back to TuneReach
        </Link>

        <div className="mt-10">
          <div className="text-sm font-black uppercase tracking-[0.3em] text-green-400">
            Legal
          </div>

          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Privacy Policy
          </h1>

          <p className="mt-5 text-white/60">
            Effective date: September 9, 2026
          </p>
        </div>

        <div className="mt-12 space-y-10 leading-8 text-white/75">
          <section>
            <h2 className="text-2xl font-black text-white">
              1. About TuneReach
            </h2>

            <p className="mt-4">
              TuneReach is an online music promotion platform that helps
              independent artists discover relevant playlist opportunities,
              generate personalized pitches, contact playlist curators,
              organize campaigns and measure outreach performance.
            </p>

            <p className="mt-4">
              TuneReach is operated by Dimitri Sumter in the Netherlands.
              For privacy-related questions, you can contact us at{" "}
              <a
                href="mailto:hello@tunereach.app"
                className="text-green-400 hover:text-green-300"
              >
                hello@tunereach.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white">
              2. Information We Collect
            </h2>

            <p className="mt-4">
              Depending on how you use TuneReach, we may collect information
              including:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>
                Account information such as your name, email address and
                authentication details.
              </li>
              <li>
                Artist, track, release and Spotify information that you submit
                or connect to TuneReach.
              </li>
              <li>
                Playlist, curator and campaign information used to provide
                playlist matching and outreach functionality.
              </li>
              <li>
                Pitch and campaign activity, including sent messages,
                campaign status and engagement information.
              </li>
              <li>
                Email engagement information such as whether a TuneReach pitch
                was opened or whether a tracked link was clicked.
              </li>
              <li>
                Subscription and billing status related to your TuneReach
                account.
              </li>
              <li>
                Technical information such as browser, device, IP address,
                timestamps, logs and security-related information where
                necessary to operate and protect the service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white">
              3. How We Use Information
            </h2>

            <p className="mt-4">
              We use personal information to operate and improve TuneReach,
              including to:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Create and manage user accounts.</li>
              <li>Import and process music and track information.</li>
              <li>Match tracks with relevant playlist opportunities.</li>
              <li>Generate and manage playlist pitches.</li>
              <li>Send curator outreach requested by users.</li>
              <li>Track campaign performance, opens and clicks.</li>
              <li>Provide subscription and billing functionality.</li>
              <li>Provide customer support.</li>
              <li>Prevent fraud, misuse and security incidents.</li>
              <li>Improve the performance and reliability of TuneReach.</li>
              <li>Comply with applicable legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white">
              4. Legal Bases for Processing
            </h2>

            <p className="mt-4">
              Where the GDPR or similar privacy laws apply, TuneReach processes
              personal information when necessary to perform a contract with
              you, comply with legal obligations, pursue legitimate business
              interests such as operating and securing the platform, or where
              consent is required and has been provided.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white">
              5. Service Providers
            </h2>

            <p className="mt-4">
              TuneReach uses trusted third-party providers to operate the
              service. These may include:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>
                Clerk for authentication and account access.
              </li>
              <li>
                Stripe for subscription billing and payment processing.
              </li>
              <li>
                Spotify for music and track-related information where
                available.
              </li>
              <li>
                Resend and related email infrastructure for sending TuneReach
                email communications and curator outreach.
              </li>
              <li>
                Hosting, database, analytics and infrastructure providers
                required to operate TuneReach.
              </li>
            </ul>

            <p className="mt-4">
              Payment card information entered during checkout is processed by
              Stripe. TuneReach does not need to store your full payment card
              number on its own servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white">
              6. Email and Campaign Tracking
            </h2>

            <p className="mt-4">
              TuneReach may use tracking technologies in campaign emails to
              determine whether an email has been opened or whether a tracked
              link has been clicked. This information helps artists understand
              campaign engagement and performance.
            </p>

            <p className="mt-4">
              Tracking information may include timestamps, campaign
              identifiers, pitch identifiers and related technical data
              necessary to attribute an interaction to a TuneReach campaign.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white">
              7. Curator Information
            </h2>

            <p className="mt-4">
              TuneReach may process publicly available or lawfully obtained
              professional contact information relating to playlist curators
              for the purpose of helping artists identify and contact relevant
              playlist opportunities.
            </p>

            <p className="mt-4">
              Curators who have questions about their information or want to
              request correction or removal can contact{" "}
              <a
                href="mailto:hello@tunereach.app"
                className="text-green-400 hover:text-green-300"
              >
                hello@tunereach.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white">
              8. Data Retention
            </h2>

            <p className="mt-4">
              We retain personal information for as long as reasonably
              necessary to provide TuneReach, maintain business and security
              records, resolve disputes, enforce agreements and comply with
              applicable legal obligations.
            </p>

            <p className="mt-4">
              Retention periods may vary depending on the type of information
              and why it is processed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white">
              9. International Processing
            </h2>

            <p className="mt-4">
              Some service providers used by TuneReach may process information
              outside the Netherlands or European Economic Area. Where
              required, appropriate safeguards are used for international
              transfers of personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white">
              10. Your Privacy Rights
            </h2>

            <p className="mt-4">
              Depending on applicable law, you may have rights relating to your
              personal information, including the right to request access,
              correction, deletion, restriction, objection or portability.
            </p>

            <p className="mt-4">
              You may also have the right to withdraw consent where processing
              is based on consent and to lodge a complaint with an applicable
              data protection authority.
            </p>

            <p className="mt-4">
              To make a privacy request, email{" "}
              <a
                href="mailto:hello@tunereach.app"
                className="text-green-400 hover:text-green-300"
              >
                hello@tunereach.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white">
              11. Security
            </h2>

            <p className="mt-4">
              TuneReach uses reasonable technical and organizational measures
              designed to protect personal information against unauthorized
              access, alteration, disclosure or loss. No internet-based system,
              however, can guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white">
              12. Children
            </h2>

            <p className="mt-4">
              TuneReach is intended for users who are legally able to enter
              into agreements for the service. TuneReach is not designed to
              knowingly collect personal information from children in
              violation of applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white">
              13. Changes to This Privacy Policy
            </h2>

            <p className="mt-4">
              We may update this Privacy Policy when TuneReach changes or when
              legal or operational requirements change. The effective date at
              the top of this page will indicate the latest published version.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white">
              14. Contact
            </h2>

            <p className="mt-4">
              Privacy questions or requests can be sent to:
            </p>

            <p className="mt-4">
              TuneReach
              <br />
              Operated by Dimitri Sumter
              <br />
              Netherlands
              <br />
              Email:{" "}
              <a
                href="mailto:hello@tunereach.app"
                className="text-green-400 hover:text-green-300"
              >
                hello@tunereach.app
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 text-sm text-white/40">
          © {new Date().getFullYear()} TuneReach.
        </div>
      </div>
    </main>
  );
}