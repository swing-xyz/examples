"use client";

import { SwingSDK } from "@swing.xyz/sdk";
import { useContext, useEffect, useState, createContext } from "react";

const swingSdk = new SwingSDK({
  projectId: "example-staking-sdk-nextjs",
  // environment: "testnet",
  // debug: true,
});

const SwingSdkContext = createContext<[SwingSDK, { isReady: boolean }]>([
  swingSdk,
  { isReady: false },
]);

export function useSwingSdk() {
  return useContext(SwingSdkContext);
}

export function SwingSdkProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    swingSdk
      .init()
      .then(() => {
        setIsReady(true);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <SwingSdkContext.Provider value={[swingSdk, { isReady }]}>
      {children}
    </SwingSdkContext.Provider>
  );
}
