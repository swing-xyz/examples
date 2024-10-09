"use client";

import React from "react";
import { Container } from "./Container";

import SwapSDK from "../Swap";
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapters";
import { WalletProvider } from "@tronweb3/tronwallet-adapter-react-hooks";

export function Hero() {
  const adapters = [new TronLinkAdapter()];

  return (
    <WalletProvider adapters={adapters} autoConnect={true}>
      <div className="relative w-full overflow-hidden py-2">
        <Container className="flex w-full grow justify-center gap-16">
          <div className="relative min-h-[80vh] w-[70vw] grow">
            <SwapSDK />
          </div>
        </Container>
      </div>
    </WalletProvider>
  );
}
