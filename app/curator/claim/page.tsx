import { Suspense } from "react";
import ClaimClient from "./ClaimClient";

export default function CuratorClaimPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#090b0a] px-5 py-12 text-white">
          <div className="mx-auto max-w-3xl">
            <p className="text-zinc-400">
              Loading curator verification...
            </p>
          </div>
        </main>
      }
    >
      <ClaimClient />
    </Suspense>
  );
}
