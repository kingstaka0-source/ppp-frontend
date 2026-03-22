import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto p-8">Loading…</div>}>
      <DashboardClient />
    </Suspense>
  );
}