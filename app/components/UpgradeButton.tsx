"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";
const ARTIST_ID = process.env.NEXT_PUBLIC_ARTIST_ID || "";

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    if (!ARTIST_ID) {
      alert("Missing NEXT_PUBLIC_ARTIST_ID");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/billing/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-artist-id": ARTIST_ID,
        },
      });

      const text = await res.text();

      if (!res.ok) {
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = JSON.parse(text);

      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }

      window.location.href = data.url;
    } catch (e: any) {
      alert(e?.message || "Could not open checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={startCheckout}
      disabled={loading}
      className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
    >
      {loading ? "Opening checkout…" : "Upgrade to PRO"}
    </button>
  );
}