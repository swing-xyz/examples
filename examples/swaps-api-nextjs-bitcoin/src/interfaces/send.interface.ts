export interface SendTransactionApiResponse {
  id: number;
  fromToken: Token;
  toToken: Token;
  fromChain: Chain;
  toChain: Chain;
  route: Route[];
  tx: TransactionDetails;
}

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

interface Chain {
  chainId: number;
  name: string;
  slug: string;
  protocolType: string;
}

interface Route {
  bridge: string;
  bridgeTokenAddress: string;
  steps: string[];
  name: string;
  part: number;
}

interface TransactionDetails {
  from: string;
  to: string;
  data: string;
  value: string;
  gas: string;
  meta: Meta;
}

interface Meta {
  from: string;
  recipient: string;
  amount: Amount;
  memo: string;
  slippage: number;
}

interface Amount {
  amount: string;
  decimals: number;
}

export interface SendTransactionPayload {
  fromUserAddress: string;
  toUserAddress: string;
  tokenSymbol: string;
  fromTokenAddress: string;
  fromChain: string;
  toTokenSymbol: string;
  toTokenAddress: string;
  toChain: string;
  tokenAmount: string;
  toTokenAmount: string;
  route: Route[];
  projectId?: string;
  type?: string;
  integration?: string;
}

interface Route {
  bridge: string;
  bridgeTokenAddress: string;
  steps: string[];
  name: string;
  part: number;
}
