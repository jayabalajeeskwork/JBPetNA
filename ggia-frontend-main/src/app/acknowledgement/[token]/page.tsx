import { Suspense } from "react";
import AcknowledgementPageClient from "../AcknowledgementPageClient";

export default async function AcknowledgementPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  
  return (
    <Suspense>
      <AcknowledgementPageClient token={token} />
    </Suspense>
  );
}
