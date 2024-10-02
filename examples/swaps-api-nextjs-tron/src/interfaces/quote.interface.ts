export interface QuoteQueryParams {
  tokenSymbol: string;
  dummyFromUserAddress?: string;
  toTokenSymbol: string;
  tokenAmount: string;
  fromTokenAddress: string;
  dummyToUserAddress?: string;
  fromChain: string;
  toChain: string;
  fromUserAddress: string;
  maxSlippage?: number;
  toUserAddress: string;
  partner?: string;
  projectId?: string;
  toTokenAddress: string;
  debug?: string;
  contractCall?: boolean;
  skipGasEstimate?: boolean;
  fee?: number;
  nativeStaking?: boolean;
}

export interface QuoteAPIResponse {
  routes: Route[];
  fromToken: Token;
  fromChain: Chain;
  toToken: Token;
  toChain: Chain;
}

export interface Route {
  route: RouteStep[];
  quote: Quote;
  duration: number;
  gas: string;
  distribution?: {
    [key: string]: number;
  };
  gasUSD: string;
}

export interface RouteStep {
  bridge: string;
  bridgeTokenAddress: string;
  steps: (
    | "allowance"
    | "approve"
    | "send"
    | "nativeStaking"
    | "sign"
    | "claim"
    | "bridge"
  )[];
  name: string;
  part: number;
  encryptionKeyRequired?: boolean | undefined;
}

interface Quote {
  bridgeFeeInNativeToken: string;
  bridgeFee: string;
  integration: string;
  type: "swap" | "custom_contract" | "deposit" | "withdraw" | "claim" | null;
  fromAmount?: string;
  amount: string;
  decimals: number;
  amountUSD: string;
  bridgeFeeUSD: string;
  bridgeFeeInNativeTokenUSD: string;
  fees: Fee[];
}

interface Fee {
  type: "bridge" | "gas" | "partner";
  amount: string;
  amountUSD: string;
  tokenSymbol: string;
  tokenAddress: string;
  chainSlug: string;
  decimals: number;
  deductedFromSourceToken: boolean;
}

interface Token {
  symbol: string;
  name?: string | undefined;
  address: string;
  decimals: number;
  chainId?: number | undefined;
  chain?: string | undefined;
  logoURI?: string | undefined;
}

interface Chain {
  chainId: number;
  name?: string;
  slug: string;
  protocolType: "evm" | "ibc" | "solana" | "multiversx";
  logo?: string;
  isSingleChainSupported?: boolean;
  blockExploreUrls?: string[];
  tokenExplorer?: string;
  txExplorer?: string;
}
