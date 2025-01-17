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
  txId?: string;
  meta?: {
    visible: boolean;
    txID: string;
    raw_data: {
      contract: Array<{
        parameter: {
          value: {
            data: string;
            owner_address: string;
            contract_address: string;
            call_value: number;
          };
          type_url: string;
        };
        type: string;
      }>;
      ref_block_bytes: string;
      ref_block_hash: string;
      expiration: number;
      fee_limit: number;
      timestamp: number;
    };
    raw_data_hex: string;
  };
}

interface Chain {
  chainId: number;
  name?: string | undefined;
  slug: string;
  protocolType: "evm" | "ibc" | "solana" | "multiversx";
}
