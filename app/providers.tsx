import { NuqsAdapter } from 'nuqs/adapters/next/app';
import React, { Suspense } from 'react';

const Providers = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
          読み込み中…
        </div>
      } // ✅ 这里是 Suspense 的 fallback
    >
      <NuqsAdapter>{children}</NuqsAdapter>
    </Suspense>
  );
};

export default Providers;
