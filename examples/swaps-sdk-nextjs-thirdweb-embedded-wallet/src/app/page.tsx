"use client";

import { Hero } from "../components/ui/Hero";
import {
  ThirdwebProvider,
  embeddedWallet,
} from "../components/ThirdwebProvider";
import { CustomSwingSdkProvider } from "../components/hooks/useSwingSDK";
import { Header } from "components/ui/Header";
import { ModalProvider } from "components/hooks/useModal";
import { Modal } from "components/ui/Modal";
import { SelectChainProvider } from "components/hooks/useSelectChain";

export default function Home() {
  return (
    <ThirdwebProvider
      clientId="284da4bf4be0bc5277bb465894d75fa7"
      supportedWallets={[embeddedWallet({})]}
    >
      <CustomSwingSdkProvider>
        <ModalProvider>
          <SelectChainProvider>
            <Modal />
            <Header />
            <Hero />
          </SelectChainProvider>
        </ModalProvider>
      </CustomSwingSdkProvider>
    </ThirdwebProvider>
  );
}
