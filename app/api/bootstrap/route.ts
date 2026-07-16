import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3100";

const LEGAL_VERSION = "2026-02-16";

const REQUIRED_DOCUMENTS = [
  "TERMS",
  "PRIVACY",
  "PITCH_CONSENT",
  "BILLING_TERMS",
] as const;

export async function POST(request: NextRequest) {
  try {
    const { getToken, userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));

    if (body.acceptedLegal !== true) {
      return NextResponse.json(
        { error: "You must accept the legal agreements." },
        { status: 400 },
      );
    }

    const token = await getToken();

    if (!token) {
      return NextResponse.json(
        { error: "Could not create an authentication token." },
        { status: 401 },
      );
    }

    // 1. Zoek of maak de persoonlijke Artist
    const bootstrapResponse = await fetch(`${API_URL}/auth/bootstrap`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const bootstrapText = await bootstrapResponse.text();

    let bootstrapData: {
      artist?: { id: string };
      error?: string;
    };

    try {
      bootstrapData = JSON.parse(bootstrapText);
    } catch {
      return NextResponse.json(
        {
          error: `Backend returned a non-JSON response (${bootstrapResponse.status}).`,
        },
        { status: 502 },
      );
    }

    if (!bootstrapResponse.ok || !bootstrapData.artist?.id) {
      return NextResponse.json(
        {
          error:
            bootstrapData.error ||
            "Could not create TuneReach artist profile.",
        },
        { status: bootstrapResponse.status || 500 },
      );
    }

    const artistId = bootstrapData.artist.id;

    // 2. Leg alle vereiste overeenkomsten vast
    for (const docType of REQUIRED_DOCUMENTS) {
      const legalResponse = await fetch(`${API_URL}/legal/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectType: "ARTIST",
          subjectId: artistId,
          docType,
          version: LEGAL_VERSION,
        }),
        cache: "no-store",
      });

      const legalText = await legalResponse.text();

      let legalData: {
        error?: string;
        details?: string;
      } = {};

      try {
        legalData = JSON.parse(legalText);
      } catch {
        // De fout hieronder geeft een duidelijker bericht.
      }

      if (!legalResponse.ok) {
        return NextResponse.json(
          {
            error:
              legalData.details ||
              legalData.error ||
              `Could not accept ${docType}.`,
          },
          { status: legalResponse.status || 500 },
        );
      }
    }

    return NextResponse.json({
      ok: true,
      artist: bootstrapData.artist,
    });
  } catch (error) {
    console.error("FRONTEND BOOTSTRAP ERROR", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not complete onboarding.",
      },
      { status: 500 },
    );
  }
}