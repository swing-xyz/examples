export interface Chain {
  id: string;
  slug: string;
  name: string;
  logo: string;
  type: "solana" | "evm" | "bitcoin" | "ibc" | "multiversx";
  singleChainSwap: boolean;
  singleChainStaking: boolean;
  txExplorer?: string | undefined;
  tokenExplorer?: string | undefined;
  rpcUrl?: string | undefined;
  nativeToken?: {
    symbol: string;
    decimals: number;
    logo: string;
    address: string;
    chain: string;
  };
}

export interface ChainsQueryParams {
  integration?: string | undefined;
  type?: "evm" | "ibc" | "solana" | "multiversx" | "bitcoin" | undefined;
}
