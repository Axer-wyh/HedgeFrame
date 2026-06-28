import { Suspense } from "react";

import { AccountPage } from "../account-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[rgb(var(--hf-bg))]" />}>
      <AccountPage />
    </Suspense>
  );
}
