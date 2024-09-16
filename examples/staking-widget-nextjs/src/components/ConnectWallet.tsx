'use client';

import { useAccount, useEnsName, useConnect, useConnectors } from 'wagmi';
import { Button } from './ui/button';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { connect } = useConnect();
  const connectors = useConnectors();

  return (
    <Button
      onClick={() => {
        if (isConnected) return;

        connect({ connector: connectors[0] });
      }}
    >
      {isConnected ? ensName ?? address : 'Connect Wallet'}
    </Button>
  );
}
