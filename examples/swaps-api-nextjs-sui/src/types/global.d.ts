interface SolanaProvider {
  isPhantom: boolean;
  publicKey: {
    toString(): string;
  };
  connect: (args?: {
    onlyIfTrusted: boolean;
  }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: (event: string, handler: (args: any) => void) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: (method: string, params: any) => Promise<any>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAndSendTransaction: (
    transaction: Transaction,
  ) => Promise<{ signature: string }>;
}

interface Window {
  solana?: SolanaProvider;
}
