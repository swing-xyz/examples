import { Chain } from "@swing.xyz/sdk";
import { useSwingSdk } from "@swing.xyz/ui";
import { useCallback } from "react";
import { useAccount, useConnect } from "wagmi";

export function useConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const swingSDK = useSwingSdk();

  async function connectWallet(
    chain?: Chain
  ): Promise<`0x${string}` | undefined> {
    if (isConnected) {
      return address;
    }

    const connection = await connectAsync({
      chainId: chain?.chainId,
      connector: connectors[0],
    });

    const walletClient = await connection.connector?.getWalletClient();

    const connectionChain = swingSDK.chains.find(
      (chain) => chain.chainId === connection.chain.id
    );

    // Pass transport into Swing SDK: https://wagmi.sh/react/ethers-adapters#wallet-client--signer
    await swingSDK.wallet.connect(
      walletClient!.transport,
      connectionChain?.slug || "ethereum"
    );

    return connection.account;
  }

  return useCallback(connectWallet, [
    isConnected,
    connectAsync,
    connectors,
    swingSDK,
    swingSDK.isReady,
    address,
  ]);
}
