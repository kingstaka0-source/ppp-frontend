"use client";

import React, { useMemo, useState } from "react";

type DocType = "TERMS" | "PRIVACY" | "BILLING_TERMS" | "PITCH_CONSENT";
type SubjectType = "ARTIST" | "CURATOR";

type LegalBlock = {
  accepted: Record<string, { version: string; acceptedAt: string }>;
  required: Record<string, string>;
  missing?: string[];
  allAccepted?: boolean;
};

type Props = {
  subjectType: SubjectType;
  subjectId: string;
  legal: LegalBlock | null | undefined;

  // na accept: laat parent refreshen
  onAccepted?: () => Promise<void> | void;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

function titleFor(doc: DocType) {
  switch (doc) {
    case "TERMS":
      return "Terms & Conditions";
    case "PRIVACY":
      return "Privacy Policy";
    case "BILLING_TERMS":
      return "Billing Terms";
    case "PITCH_CONSENT":
      return "Pitch Consent";
    default:
      return doc;
  }
}

export default function LegalGate({ subjectType, subjectId, legal, onAccepted }: Props) {
  const required = legal?.required ?? {};
  const accepted = legal?.accepted ?? {};
  const missing = useMemo(() => {
    // backend geeft missing[] soms mee; zo niet, berekenen we het:
    if (Array.isArray(legal?.missing)) return legal!.missing!;
    return Object.keys(required).filter((doc) => {
      const reqV = required[doc];
      const got = accepted?.[doc]?.version;
      return !got || got !== reqV;
    });
  }, [legal, required, accepted]);

  const isOpen = missing.length > 0;

  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function accept(docType: DocType) {
    const version = required[docType];
    if (!version) return;

    const res = await fetch(`${API}/legal/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectType,
        subjectId,
        docType,
        version,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `legal/accept failed (${res.status})`);
    }
  }

  async function onSubmit() {
    setErr(null);
    setBusy(true);
    try {
      // accepteer alleen wat nog missing is
      for (const doc of missing) {
        if (!checks[doc]) {
          setBusy(false);
          setErr(`Vink "${titleFor(doc as DocType)}" aan om door te gaan.`);
          return;
        }
      }

      for (const doc of missing) {
        await accept(doc as DocType);
      }

      // laat parent data opnieuw ophalen
      await onAccepted?.();
    } catch (e: any) {
      setErr(e?.message ?? "Er ging iets mis met accepteren.");
    } finally {
      setBusy(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "white",
          borderRadius: 12,
          padding: 18,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          Accepteer de voorwaarden om door te gaan
        </h2>
        <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 16 }}>
          We moeten je akkoord loggen (met versie + timestamp) voordat je de app kunt gebruiken.
        </p>

        <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
          {missing.map((doc) => (
            <label
              key={doc}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <input
                type="checkbox"
                checked={!!checks[doc]}
                onChange={(e) => setChecks((p) => ({ ...p, [doc]: e.target.checked }))}
                style={{ marginTop: 2 }}
              />
              <div>
                <div style={{ fontWeight: 600 }}>{titleFor(doc as DocType)}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  Required version: <code>{required[doc]}</code>
                </div>
              </div>
            </label>
          ))}
        </div>

        {err ? (
          <div
            style={{
              background: "rgba(255,0,0,0.06)",
              border: "1px solid rgba(255,0,0,0.18)",
              borderRadius: 10,
              padding: 10,
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {err}
          </div>
        ) : null}

        <button
          onClick={onSubmit}
          disabled={busy}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "none",
            fontWeight: 700,
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? "Bezig..." : "Akkoord & doorgaan"}
        </button>

        <div style={{ fontSize: 12, opacity: 0.65, marginTop: 10 }}>
          Tip: later kun je hier links zetten naar je echte Terms/Privacy pagina’s.
        </div>
      </div>
    </div>
  );
}
