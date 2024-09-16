export const pendingStatuses = [
  'Submitted',
  'Not Sent',
  'Pending Source Chain',
  'Pending Destination Chain',
];

export interface SendTransactionApiResponse {
  id: number;
  fromToken: Token;
  toToken: Token;
  fromChain: Chain;
  toChain: Chain;
  route: Route[];
  tx?: TransactionDetails;
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
  protocolType: string;
}

export interface TransactionDetails {
  from: string;
  to: string;
  data: string;
  value?: string;
  nonce?: number;
  txId?: string;
  gas?: string;
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
  steps: (
    | 'allowance'
    | 'approve'
    | 'send'
    | 'nativeStaking'
    | 'sign'
    | 'claim'
    | 'bridge'
  )[];
  name: string;
  part: number;
}
