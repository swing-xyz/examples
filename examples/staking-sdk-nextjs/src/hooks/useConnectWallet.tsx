import { Chain } from "@swing.xyz/sdk";
import { useSwingSdk } from "components/SwingSdkProvider";
import { useCallback } from "react";
import { useAccount, useConnect } from "wagmi";

export function useConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const [swingSDK] = useSwingSdk();

  async function connectWallet(
    chain?: Chain,
  ): Promise<`0x${string}` | undefined> {
    if (isConnected) {
      return address;
    }

    const connector = connectors[0];

    const connection = await connectAsync({
      chainId: chain?.chainId,
      connector,
    });

    const provider = await connector.getProvider();
    const chainId = await connector.getChainId();

    await swingSDK.wallet.connect(provider, chainId);

    return connection.accounts[0];
  }

  return useCallback(connectWallet, [
    isConnected,
    connectAsync,
    connectors,
    swingSDK,
    address,
  ]);
}
