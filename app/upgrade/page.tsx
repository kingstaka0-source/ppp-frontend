"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

export default function UpgradePage() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function loadUsage() {
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch(`${API}/artists/${ARTIST_ID}/usage`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error(await res.text());
      setUsage(await res.json());
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load usage");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsage();
  }, []);

  async function startTrial() {
    setBusy(true);
    setErr(null);
    setMsg(null);

    try {
      const res = await fetch(`${API}/artists/${ARTIST_ID}/start-trial`, {
        method: "POST",
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

      const data = JSON.parse(text);
      setMsg(data.message || "Trial started");
      await loadUsage();
    } catch (e: any) {
      setErr(e?.message ?? "Start trial failed");
    } finally {
      setBusy(false);
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
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

      const data = JSON.parse(text);
      setMsg(data.message || "Trial canceled");
      await loadUsage();
    } catch (e: any) {
      setErr(e?.message ?? "Cancel trial failed");
    } finally {
      setBusy(false);
    }
  }

  async function startCheckout() {
    setCheckoutLoading(true);
    setErr(null);
    setMsg(null);

    try {
      const res = await fetch(`${API}/billing/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ARTIST_ID ? { "x-artist-id": ARTIST_ID } : {}),
        },
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

      const data = JSON.parse(text);
      if (!data?.url) throw new Error("No checkout URL returned");

      window.location.href = data.url;
    } catch (e: any) {
      setErr(e?.message ?? "Start checkout failed");
    } finally {
      setCheckoutLoading(false);
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
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

      const data = JSON.parse(text);
      if (!data?.url) throw new Error("No portal URL returned");

      window.location.href = data.url;
    } catch (e: any) {
      setErr(e?.message ?? "Open billing portal failed");
    } finally {
      setPortalLoading(false);
    }
  }

  const trialUntil = usage?.trial?.until ? new Date(usage.trial.until) : null;

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
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

      {usage && (
        <div className="border rounded-xl p-6 space-y-4">
          <div className="text-sm text-gray-600">Current plan</div>
          <div className="text-2xl font-bold">{usage.plan}</div>

          {usage.plan === "FREE" && (
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

          {usage.plan === "TRIAL" && (
            <div className="text-gray-700">
              Trial active until: <b>{trialUntil?.toLocaleString()}</b> (unlimited pitches)
            </div>
          )}

          {usage.plan === "PRO" && (
            <div className="text-gray-700">Unlimited pitches</div>
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

          <div className="pt-2 flex flex-wrap gap-3">
            {usage.plan !== "PRO" && (
              <button
                onClick={startCheckout}
                disabled={checkoutLoading}
                className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
              >
                {checkoutLoading ? "Opening checkout…" : "Upgrade to PRO"}
              </button>
            )}

            <button
              onClick={startTrial}
              disabled={busy || usage.plan === "TRIAL" || usage.plan === "PRO"}
              className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            >
              {busy ? "Working…" : "Start 7-day trial"}
            </button>

            <button
              onClick={cancelTrial}
              disabled={busy || usage.plan !== "TRIAL"}
              className="px-4 py-2 rounded border border-black disabled:opacity-50"
            >
              {busy ? "Working…" : "Cancel trial → FREE"}
            </button>

            {usage.plan === "PRO" && (
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