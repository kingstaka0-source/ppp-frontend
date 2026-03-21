"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import UpgradeButton from "@/app/components/UpgradeButton";

type Usage = {
  artistId: string;
  plan: "FREE" | "TRIAL" | "PRO";
  trial: null | { until: string };
  month: {
    sentThisMonth: number;
    createdThisMonth: number;
    limit: number | null;
    remaining: number | null;
  };
};

type BillingStatus = {
  id: string;
  name: string | null;
  email: string | null;
  plan: "FREE" | "TRIAL" | "PRO";
  trialUntil: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus:
    | "NONE"
    | "TRIALING"
    | "ACTIVE"
    | "PAST_DUE"
    | "CANCELED"
    | "INCOMPLETE";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

export default function UpgradePage() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [trialCheckoutLoading, setTrialCheckoutLoading] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const canceled = params.get("canceled");

    if (success === "1") {
      setMsg("Payment or trial checkout completed. Your billing status is updating.");
    } else if (canceled === "1") {
      setMsg("Checkout canceled. No payment was completed.");
    }
  }, []);

  async function loadAll() {
    setLoading(true);
    setErr(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (ARTIST_ID) {
        headers["x-artist-id"] = ARTIST_ID;
      }

      const [usageRes, billingRes] = await Promise.all([
        fetch(`${API}/artists/${ARTIST_ID}/usage`, {
          cache: "no-store",
          headers,
        }),
        fetch(`${API}/billing/status`, {
          cache: "no-store",
          headers,
        }),
      ]);

      const usageText = await usageRes.text();
      const billingText = await billingRes.text();

      if (!usageRes.ok) {
        throw new Error(usageText || `Usage failed (${usageRes.status})`);
      }

      if (!billingRes.ok) {
        throw new Error(billingText || `Billing failed (${billingRes.status})`);
      }

      setUsage(JSON.parse(usageText));
      setBilling(JSON.parse(billingText).billing);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load billing page");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function startTrial() {
    setTrialCheckoutLoading(true);
    setErr(null);
    setMsg(null);

    try {
      const res = await fetch(`${API}/artists/${ARTIST_ID}/start-trial`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ARTIST_ID ? { "x-artist-id": ARTIST_ID } : {}),
        },
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = JSON.parse(text);

      if (!data?.url) {
        throw new Error("No Stripe checkout URL returned for trial");
      }

      window.location.href = data.url;
    } catch (e: any) {
      setErr(e?.message ?? "Start trial failed");
    } finally {
      setTrialCheckoutLoading(false);
    }
  }

  async function cancelTrial() {
    setBusy(true);
    setErr(null);
    setMsg(null);

    try {
      const res = await fetch(`${API}/artists/${ARTIST_ID}/cancel-trial`, {
        method: "POST",
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = JSON.parse(text);
      setMsg(data.message || "Trial canceled");
      await loadAll();
    } catch (e: any) {
      setErr(e?.message ?? "Cancel trial failed");
    } finally {
      setBusy(false);
    }
  }

  async function openPortal() {
    setPortalLoading(true);
    setErr(null);

    try {
      const res = await fetch(`${API}/billing/create-portal-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ARTIST_ID ? { "x-artist-id": ARTIST_ID } : {}),
        },
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = JSON.parse(text);

      if (!data?.url) {
        throw new Error("No portal URL returned");
      }

      window.location.href = data.url;
    } catch (e: any) {
      setErr(e?.message ?? "Open billing portal failed");
    } finally {
      setPortalLoading(false);
    }
  }

  const trialUntil = usage?.trial?.until
    ? new Date(usage.trial.until)
    : billing?.trialUntil
    ? new Date(billing.trialUntil)
    : null;

  const currentPeriodEnd = billing?.currentPeriodEnd
    ? new Date(billing.currentPeriodEnd)
    : null;

  const effectivePlan = useMemo(() => {
    if (billing?.plan) return billing.plan;
    if (usage?.plan) return usage.plan;
    return "FREE";
  }, [billing, usage]);

  const subscriptionLabel = billing?.subscriptionStatus || "NONE";

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">Upgrade</h1>

        <Link
          href="/dashboard"
          className="px-3 py-2 rounded border border-black hover:bg-black hover:text-white transition"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="text-sm text-gray-600">
        API: {API} • Artist: {ARTIST_ID}
      </div>

      {loading && <p>Loading…</p>}
      {err && <p className="text-red-600 whitespace-pre-wrap">Error: {err}</p>}
      {msg && <p className="text-green-700 whitespace-pre-wrap">{msg}</p>}

      {!loading && usage && billing && (
        <div className="border rounded-xl p-6 space-y-5">
          <div>
            <div className="text-sm text-gray-600">Current plan</div>
            <div className="text-2xl font-bold">{effectivePlan}</div>
            <div className="text-sm text-gray-600 mt-1">
              Subscription status: <b>{subscriptionLabel}</b>
            </div>
          </div>

          {effectivePlan === "FREE" && (
            <div className="text-gray-700 space-y-1">
              <div>
                FREE monthly pitch limit: <b>{usage.month.createdThisMonth}</b> /{" "}
                <b>{usage.month.limit}</b>
              </div>
              <div>
                Remaining this month: <b>{usage.month.remaining}</b>
              </div>
              <div>
                Sent this month: <b>{usage.month.sentThisMonth}</b>
              </div>
            </div>
          )}

          {effectivePlan === "TRIAL" && (
            <div className="text-gray-700 space-y-1">
              <div>
                Trial active until: <b>{trialUntil?.toLocaleString()}</b>
              </div>
              <div>Unlimited pitches during trial.</div>
            </div>
          )}

          {effectivePlan === "PRO" && (
            <div className="text-gray-700 space-y-1">
              <div>Unlimited pitches active.</div>
              {currentPeriodEnd && (
                <div>
                  Current period ends: <b>{currentPeriodEnd.toLocaleString()}</b>
                </div>
              )}
              {billing.cancelAtPeriodEnd && (
                <div className="text-yellow-700">
                  Your subscription is set to cancel at the end of the current period.
                </div>
              )}
            </div>
          )}

          <div className="border rounded-lg p-4 bg-gray-50 space-y-2">
            <div className="font-semibold">PRO plan</div>
            <div className="text-sm text-gray-700">
              Unlimited pitches, campaign launch, auto pitch + send, billing portal access.
            </div>
            <div className="text-sm text-gray-700">
              Price: <b>$19/month</b>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-yellow-50 space-y-2">
            <div className="font-semibold">7-day trial</div>
            <div className="text-sm text-gray-700">
              Trial now requires card details upfront through Stripe checkout.
            </div>
            <div className="text-sm text-gray-700">
              After 7 days, Stripe will automatically attempt the first payment.
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            {effectivePlan !== "PRO" && <UpgradeButton />}

            <button
              onClick={startTrial}
              disabled={
                trialCheckoutLoading ||
                busy ||
                effectivePlan === "TRIAL" ||
                effectivePlan === "PRO"
              }
              className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            >
              {trialCheckoutLoading ? "Opening Stripe…" : "Start 7-day trial"}
            </button>

            <button
              onClick={cancelTrial}
              disabled={busy || effectivePlan !== "TRIAL"}
              className="px-4 py-2 rounded border border-black disabled:opacity-50"
            >
              {busy ? "Working…" : "Cancel trial → FREE"}
            </button>

            {effectivePlan === "PRO" && (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="px-4 py-2 rounded border border-black disabled:opacity-50"
              >
                {portalLoading ? "Opening…" : "Manage billing"}
              </button>
            )}

            <Link
              href="/pitches"
              className="px-4 py-2 rounded border border-black hover:bg-black hover:text-white transition"
            >
              Go to Pitches
            </Link>
          </div>

          <div className="text-xs text-gray-600 pt-2">
            FREE = 3 created pitches per month. TRIAL/PRO = unlimited.
            Bulk campaigns are locked for FREE and available on TRIAL/PRO.
          </div>
        </div>
      )}
    </div>
  );
}