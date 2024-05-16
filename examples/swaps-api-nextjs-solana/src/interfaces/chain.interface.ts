export interface Chain {
  id: string;
  slug: string;
  name: string;
  logo: string;
  type: string;
  tokenExplorer: string;
  txExplorer: string;
  rpcUrl: string;
  singleChainSwap: boolean;
  singleChainStaking: boolean;
  nativeToken: {
    symbol: string;
    decimals: number;
    logo: string;
    address: string;
    chain: string;
  };
}

export interface ChainsAPIResponse extends Array<Chain> {}

export interface ChainsQueryParams {
  type: string;
}
