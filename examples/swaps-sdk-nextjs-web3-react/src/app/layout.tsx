'use client';

import 'styles/globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

import { Header } from '../components/ui/Header';
import { Footer } from '../components/ui/Footer';

import {
  Web3ReactHooks,
  Web3ReactProvider,
  initializeConnector,
} from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';

import { Toaster } from '../components/ui/toaster';

export const [metaMask, hooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions }),
);

const connectors: [MetaMask, Web3ReactHooks][] = [[metaMask, hooks]];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />

      <body className="bg-black">
        <Header />

        <Web3ReactProvider connectors={connectors}>
          <main>{children}</main>
        </Web3ReactProvider>

        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
