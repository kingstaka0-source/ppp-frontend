"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BootstrapResponse = {
  artist?: {
    id: string;
  };
  error?: string;
};

export default function ContinueButton() {
  const router = useRouter();

  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function continueToDashboard() {
    if (!acceptedLegal) {
      setError("Please accept the agreements before continuing.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/bootstrap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          acceptedLegal: true,
        }),
        cache: "no-store",
      });

      const responseText = await response.text();

      let data: BootstrapResponse;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Server returned a non-JSON response (${response.status}).`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Could not complete your onboarding.",
        );
      }

      if (!data.artist?.id) {
        throw new Error("No artist ID returned by the backend.");
      }

      console.log("BOOTSTRAP RESPONSE:", data);
console.log("ARTIST ID:", data?.artist?.id);

      localStorage.setItem("tunereachArtistId", data.artist.id);

router.replace("/onboarding/wizard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not complete your onboarding.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
        <input
          type="checkbox"
          checked={acceptedLegal}
          onChange={(event) => {
            setAcceptedLegal(event.target.checked);
            setError("");
          }}
          className="mt-1 h-5 w-5 accent-green-500"
        />

        <span className="text-sm leading-6 text-white/70">
          I agree to the{" "}
          <a
            href="/terms"
            target="_blank"
            className="font-bold text-green-400 hover:underline"
          >
            Terms
          </a>
          ,{" "}
          <a
            href="/privacy"
            target="_blank"
            className="font-bold text-green-400 hover:underline"
          >
            Privacy Policy
          </a>
          , Pitch Consent and Billing Terms.
        </span>
      </label>

      <button
        type="button"
        onClick={continueToDashboard}
        disabled={loading || !acceptedLegal}
        className="inline-flex rounded-full bg-green-500 px-8 py-4 font-black text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Creating your profile..."
          : "Continue to Dashboard →"}
      </button>

      {error ? (
        <p className="mt-4 text-sm font-semibold text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}