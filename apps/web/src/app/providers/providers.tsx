'use client';

import type { ReactNode } from 'react';
import { UIToast } from '@zuko/ui';
import { StoreProvider } from './store-provider';
import { QueryProvider } from './query-provider';
import { SessionGate } from './session-gate';
import { SocketProvider } from './socket-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <QueryProvider>
        <UIToast>
          <SessionGate>
            <SocketProvider>{children}</SocketProvider>
          </SessionGate>
        </UIToast>
      </QueryProvider>
    </StoreProvider>
  );
}
