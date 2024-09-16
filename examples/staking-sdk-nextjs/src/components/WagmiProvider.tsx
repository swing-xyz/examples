'use client';

import { createConfig, WagmiProvider as WagmiConfig } from 'wagmi';
import * as WagmiChains from 'wagmi/chains';
import { injected, coinbaseWallet } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient, http } from 'viem';

const queryClient = new QueryClient();

const config = createConfig({
  ssr: true,
  chains: Object.values<WagmiChains.Chain>(WagmiChains) as [
    WagmiChains.Chain,
    ...WagmiChains.Chain[],
  ],

  client({ chain }) {
    return createClient({ chain, transport: http() });
  },

  connectors: [
    injected({ shimDisconnect: true, target: 'metaMask' }),
    coinbaseWallet({
      appName: 'Swing Staking Widget Example',
    }),
  ],
});

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiConfig>
  );
}
