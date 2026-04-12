import { Suspense } from "react";
import { Shell } from "@/components/shell";
import { RosterTab } from "@/components/tabs/roster-tab";

export default function RosterPage() {
  return (
    <Shell>
      <Suspense>
        <RosterTab />
      </Suspense>
    </Shell>
  );
}
