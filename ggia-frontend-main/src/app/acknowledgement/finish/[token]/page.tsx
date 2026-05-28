import { Suspense } from "react";
import FinishAcknowledgementPageClient from "../FinishAcknowledgementPageClient";

export default async function FinishAcknowledgementTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <Suspense>
      <FinishAcknowledgementPageClient />
    </Suspense>
  );
}
