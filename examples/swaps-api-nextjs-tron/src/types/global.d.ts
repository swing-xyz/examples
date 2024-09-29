interface TronLinkProvider {
  tronWeb: {
    defaultAddress: {
      base58: string;
      hex: string;
    };
    toHex: (address: string) => string;
    toBase58: (address: string) => string;
    transactionBuilder: {
      sendTrx: (
        to: string,
        amount: number,
        from: string,
      ) => Promise<Transaction>;
      triggerSmartContract: (
        contractAddress: string,
        functionSelector: string,
        options: {
          feeLimit: number;
          callValue: number;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        parameters: any[],
        issuerAddress?: string,
      ) => Promise<Transaction>;
    };
    trx: {
      sign: (transaction: Transaction) => Promise<SignedTransaction>;
      sendRawTransaction: (
        signedTransaction: SignedTransaction,
      ) => Promise<{ result: boolean; txid: string }>;
    };
  };
  ready: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: (event: string, handler: (args: any) => void) => void;
  sign: (transaction: object) => Promise<string>;
  sendTransaction: (to: string, amount: number) => Promise<{ txid: string }>;
  disconnect: () => Promise<void>;
}

interface Window {
  tronLink?: TronLinkProvider;
}
