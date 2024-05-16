export interface ApprovalTxDataQueryParams {
  bridge: string;
  fromAddress: string;
  fromChain: string;
  toChain: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenAmount: number;
  toTokenSymbol: string;
  toTokenAddress: string;
  contractCall: boolean;
}

export interface ApprovalTxDataAPIResponse {
  tx: TransactionData[];
  fromChain: Chain;
}

interface TransactionData {
  data: string;
  from: string;
  to: string;
}

interface Chain {
  chainId: number;
  name: string;
  slug: string;
  protocolType: string;
}
