import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Suspense
        fallback={
          <div className="mx-auto max-w-5xl p-8 text-white/60">Loading...</div>
        }
      >
        <DashboardClient />
      </Suspense>
    </div>
  );
}
