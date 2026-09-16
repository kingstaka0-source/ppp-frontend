"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

export default function PricingPage() {
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upgradeToPro() {
  try {
    setLoading(true);
    setError(null);

    const token = await getToken();

    if (!token) {
      throw new Error("You must be signed in.");
    }

    const r = await fetch(`${API}/billing/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const j = await r.json().catch(() => ({}));

    if (!r.ok) {
      throw new Error(j?.message || j?.error || `HTTP ${r.status}`);
    }

    if (!j?.url) {
      throw new Error("No checkout URL returned");
    }

    window.location.href = j.url;
  } catch (e: any) {
    setError(e?.message ?? "Upgrade failed");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Pricing</h1>
        <Link href="/dashboard" className="px-4 py-2 rounded border border-black">
          ← Dashboard
        </Link>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-2xl p-6 space-y-4">
          <div className="text-sm text-gray-500">FREE</div>
          <div className="text-3xl font-bold">€0</div>
          <div className="text-gray-700">For testing and emerging artists.</div>

          <ul className="space-y-2 text-sm text-gray-700">
            <li>3 pitches per month</li>
            <li>Limited AI generation</li>
            <li>No bulk campaigns</li>
          </ul>
        </div>

        <div className="border-2 border-black rounded-2xl p-6 space-y-4">
          <div className="text-sm text-gray-500">PRO</div>
          <div className="text-3xl font-bold">€19 / month</div>
          <div className="text-gray-700">
            For serious playlist outreach and automation.
          </div>

          <ul className="space-y-2 text-sm text-gray-700">
            <li>Unlimited AI pitch generation</li>
            <li>Campaign launch</li>
            <li>Email queue & send</li>
            <li>Better scalability</li>
          </ul>

          <button
            onClick={upgradeToPro}
            disabled={loading}
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          >
            {loading ? "Loading..." : "Upgrade to PRO"}
          </button>
        </div>
      </div>
    </div>
  );
}