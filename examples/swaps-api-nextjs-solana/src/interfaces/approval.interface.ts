export interface ApprovalTxDataQueryParams {
  bridge: string;
  fromAddress: string;
  fromChain: string;
  toChain: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenAmount: string;
  toTokenSymbol: string;
  toTokenAddress: string;
  contractCall: boolean;
}

export interface ApprovalTxDataAPIResponse {
  tx?: TransactionData[] | undefined;
  fromChain: Chain | undefined;
}

export interface TransactionData {
  data: string;
  to: string;
  value?: string | undefined;
  gas?: string | undefined;
  from: string;
  nonce?: number | undefined;
}

interface Chain {
  chainId: number;
  name?: string | undefined;
  slug: string;
  protocolType: "evm" | "ibc" | "solana" | "multiversx";
}
