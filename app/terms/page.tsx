import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | TuneReach",
    description:
        "Terms governing the use of the TuneReach music promotion platform.",
};

export default function TermsPage() {
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
                        Terms of Service
                    </h1>

                    <p className="mt-5 text-white/60">
                        Effective date: September 9, 2026
                    </p>
                </div>

                <div className="mt-12 space-y-10 leading-8 text-white/75">
                    <section>
                        <h2 className="text-2xl font-black text-white">
                            1. About These Terms
                        </h2>

                        <p className="mt-4">
                            These Terms of Service govern your access to and use of
                            TuneReach, an online music promotion platform based in the
                            Netherlands.
                        </p>

                        <p className="mt-4">
                            By creating an account, purchasing a subscription or using
                            TuneReach, you agree to these Terms and our Privacy Policy.
                        </p>

                        <p className="mt-4">
                            If you do not agree to these Terms, do not use TuneReach.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            2. The TuneReach Service
                        </h2>

                        <p className="mt-4">
                            TuneReach provides tools that may include music and Spotify track
                            importing, playlist matching, AI-assisted pitch generation,
                            curator outreach, campaign management, open and click tracking,
                            analytics and playlist placement monitoring.
                        </p>

                        <p className="mt-4">
                            Features may change, improve, be replaced or be discontinued as
                            the platform develops.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            3. No Guarantee of Playlist Placement
                        </h2>

                        <p className="mt-4">
                            TuneReach does not sell or guarantee playlist placements,
                            streams, followers, editorial coverage, revenue or any specific
                            promotional result.
                        </p>

                        <p className="mt-4">
                            Playlist curators independently decide whether to review, reply
                            to, accept or reject a submission.
                        </p>

                        <p className="mt-4">
                            Matching scores, recommendations and AI-generated content are
                            tools intended to assist outreach and are not guarantees of
                            success.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            4. Accounts
                        </h2>

                        <p className="mt-4">
                            You are responsible for maintaining the security of your account
                            and for activity performed through your account.
                        </p>

                        <p className="mt-4">
                            Information you provide must be accurate and you must not
                            impersonate another person or use TuneReach for fraudulent,
                            deceptive or unlawful activity.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            5. Music and Content You Submit
                        </h2>

                        <p className="mt-4">
                            You retain ownership of music, artwork, artist information and
                            other content that you submit to TuneReach.
                        </p>

                        <p className="mt-4">
                            You grant TuneReach the limited rights necessary to process,
                            display and use that content for the purpose of providing the
                            service, including playlist matching, pitch creation, campaign
                            delivery and analytics.
                        </p>

                        <p className="mt-4">
                            You are responsible for ensuring that you have the rights and
                            permissions required to use content submitted through your
                            account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            6. Curator Outreach
                        </h2>

                        <p className="mt-4">
                            TuneReach may help users contact playlist curators using contact
                            information made available through the platform.
                        </p>

                        <p className="mt-4">
                            You are responsible for using outreach features appropriately
                            and must not use TuneReach to send unlawful, misleading,
                            abusive, threatening or fraudulent communications.
                        </p>

                        <p className="mt-4">
                            TuneReach may restrict outreach, suspend sending functionality or
                            take other protective measures when necessary to protect
                            recipients, deliverability, infrastructure or the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            7. AI-Generated Content
                        </h2>

                        <p className="mt-4">
                            TuneReach may use artificial intelligence to assist with pitch
                            generation, matching, recommendations and related features.
                        </p>

                        <p className="mt-4">
                            AI-generated output may contain errors, incomplete information or
                            unsuitable wording. You remain responsible for reviewing and
                            approving communications sent through your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            8. Free Plan, Trial and TuneReach PRO
                        </h2>

                        <p className="mt-4">
                            TuneReach may offer a Free plan, a limited trial and paid
                            subscription plans.
                        </p>

                        <p className="mt-4">
                            The current TuneReach PRO plan is offered at the price displayed
                            during checkout. Where a 7-day free trial is offered, you will
                            not be charged the recurring subscription price until the trial
                            ends unless otherwise clearly stated during checkout.
                        </p>

                        <p className="mt-4">
                            At the end of a trial, the subscription may automatically renew
                            at the recurring price shown during checkout unless you cancel
                            before the renewal date.
                        </p>

                        <p className="mt-4">
                            Plan features, usage limits and prices may change for future
                            subscription periods. Material changes will be communicated or
                            displayed where required.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            9. Payments and Stripe
                        </h2>

                        <p className="mt-4">
                            Subscription payments are processed by Stripe. By subscribing,
                            you authorize Stripe and TuneReach to process the applicable
                            recurring charges associated with your selected plan.
                        </p>

                        <p className="mt-4">
                            Your payment method may be charged automatically at the start of
                            each paid billing period until the subscription is cancelled.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            10. Cancellation
                        </h2>

                        <p className="mt-4">
                            You can manage or cancel an eligible TuneReach subscription
                            through the Stripe customer billing portal made available from
                            your TuneReach account.
                        </p>

                        <p className="mt-4">
                            Unless otherwise required by law or stated during cancellation,
                            cancellation generally prevents future renewal while access may
                            continue through the remainder of an already-paid or active
                            subscription period.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            11. Refunds
                        </h2>

                        <p className="mt-4">
                            Except where a refund is required by applicable law, fees already
                            charged are generally non-refundable once a paid subscription
                            period has started.
                        </p>

                        <p className="mt-4">
                            If you believe you were charged incorrectly, contact{" "}
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
                            12. Acceptable Use
                        </h2>

                        <p className="mt-4">
                            You may not use TuneReach to:
                        </p>

                        <ul className="mt-4 list-disc space-y-2 pl-6">
                            <li>Violate applicable laws or regulations.</li>
                            <li>Send fraudulent, deceptive or abusive communications.</li>
                            <li>Distribute malware or harmful code.</li>
                            <li>Attempt unauthorized access to systems or accounts.</li>
                            <li>Interfere with TuneReach infrastructure or security.</li>
                            <li>
                                Circumvent plan limits, billing controls or technical
                                restrictions.
                            </li>
                            <li>
                                Use the service in a way that creates unreasonable risk to
                                TuneReach, curators, users or third-party providers.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            13. Third-Party Services
                        </h2>

                        <p className="mt-4">
                            TuneReach relies on third-party services such as Spotify, Stripe,
                            Clerk, email providers and hosting providers.
                        </p>

                        <p className="mt-4">
                            TuneReach is not responsible for outages, changes, restrictions
                            or decisions made by independent third-party services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            14. Availability
                        </h2>

                        <p className="mt-4">
                            We aim to keep TuneReach available and reliable, but continuous
                            or error-free availability is not guaranteed. Maintenance,
                            third-party outages, technical failures or security issues may
                            temporarily affect access.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            15. Suspension and Termination
                        </h2>

                        <p className="mt-4">
                            TuneReach may suspend or terminate access where reasonably
                            necessary because of abuse, fraud, security risks, non-payment,
                            serious violations of these Terms or legal requirements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            16. Disclaimer
                        </h2>

                        <p className="mt-4">
                            TuneReach is a promotional workflow and software platform.
                            Results depend on many factors outside TuneReach&apos;s control,
                            including music quality, curator decisions, audience behavior,
                            platform algorithms and market conditions.
                        </p>

                        <p className="mt-4">
                            To the extent permitted by applicable law, TuneReach is provided
                            on an &quot;as available&quot; basis without guarantees of
                            specific commercial or promotional outcomes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            17. Limitation of Liability
                        </h2>

                        <p className="mt-4">
                            To the maximum extent permitted by applicable law, TuneReach will
                            not be liable for indirect or consequential losses resulting
                            solely from the use or inability to use the platform.
                        </p>

                        <p className="mt-4">
                            Nothing in these Terms excludes rights or liabilities that
                            cannot legally be excluded or limited.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            18. Changes to These Terms
                        </h2>

                        <p className="mt-4">
                            These Terms may be updated when TuneReach changes or when legal,
                            billing or operational requirements change. The effective date
                            at the top of this page identifies the current published
                            version.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            19. Governing Law
                        </h2>

                        <p className="mt-4">
                            These Terms are governed by applicable Dutch law, subject to any
                            mandatory consumer protections or legal rights that apply in
                            your country of residence.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-white">
                            20. Contact
                        </h2>

                        <p className="mt-4">
                            Questions about these Terms can be sent to:
                        </p>

                        <p className="mt-4">
                            TuneReach
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