"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";

export const DefaultProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <TonConnectUIProvider manifestUrl="http://localhost:3000/api/ton-connect">
      {children}
    </TonConnectUIProvider>
  );
};
