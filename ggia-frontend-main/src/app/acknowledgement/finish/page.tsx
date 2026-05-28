import { Suspense } from "react";
import FinishAcknowledgementPageClient from "./FinishAcknowledgementPageClient";

export default function FinishAcknowledgementPage() {
  return (
    <Suspense>
      <FinishAcknowledgementPageClient />
    </Suspense>
  );
}

