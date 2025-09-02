export interface QuoteQueryParams {
  fromChain: string;
  tokenSymbol: string;
  fromTokenAddress: string;
  fromUserAddress: string;
  toChain: string;
  toTokenSymbol?: string;
  toTokenAddress?: string;
  toUserAddress?: string;
  tokenAmount: string;
}

export interface QuoteAPIResponse {
  routes: Route[];
  fromToken: Token;
  fromChain: Chain;
  toToken: Token;
  toChain: Chain;
}

export interface Route {
  duration: number;
  gas: string;
  quote: Quote;
  route: RouteStep[];
  distribution: { [key: string]: number };
  gasUSD: string;
}

interface Quote {
  integration: string;
  type: string;
  bridgeFee: string;
  bridgeFeeInNativeToken: string;
  amount: string;
  decimals: number;
  amountUSD: string;
  bridgeFeeUSD: string;
  bridgeFeeInNativeTokenUSD: string;
  fees: Fee[];
}

interface Fee {
  type: string;
  amount: string;
  amountUSD: string;
  chainSlug: string;
  tokenSymbol: string;
  tokenAddress: string;
  decimals: number;
  deductedFromSourceToken: boolean;
}

interface RouteStep {
  bridge: string;
  bridgeTokenAddress: string;
  steps: string[];
  name: string;
  part: number;
}

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

export interface Chain {
  chainId: number;
  name: string;
  slug: string;
  protocolType: string;
}
