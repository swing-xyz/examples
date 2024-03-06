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

    const walletClient = await connector.getWalletClient();
    const chainId = await connector.getChainId();

    // Pass transport into Swing SDK: https://wagmi.sh/react/ethers-adapters#wallet-client--signer
    await swingSDK.wallet.connect(walletClient.transport, chainId);

    return connection.account;
  }

  return useCallback(connectWallet, [
    isConnected,
    connectAsync,
    connectors,
    swingSDK,
    address,
  ]);
}
