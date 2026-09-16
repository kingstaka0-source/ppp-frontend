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
    <Suspense
      fallback={<div className="max-w-5xl mx-auto p-8">Loading...</div>}
    >
      <DashboardClient />
    </Suspense>
  );
}
