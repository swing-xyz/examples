'use client';

import { useAccount, useEnsName } from 'wagmi';
import { Button } from './ui/button';
import { useConnectWallet } from 'hooks/useConnectWallet';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const connectWallet = useConnectWallet();

  return (
    <Button
      onClick={async () => {
        if (isConnected) return;

        connectWallet();
      }}
    >
      {isConnected ? ensName ?? address : 'Connect Wallet'}
    </Button>
  );
}
