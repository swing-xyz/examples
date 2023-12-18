"use client";

import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { avalanche, mainnet } from "viem/chains";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { InjectedConnector } from "wagmi/connectors/injected";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, avalanche],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: false,
  publicClient,
  webSocketPublicClient,
  connectors: [
    new InjectedConnector({ chains }),
    new MetaMaskConnector({
      chains,
      options: {
        UNSTABLE_shimOnConnectSelectAccount: true,
      },
    }),
  ],
});

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
}
