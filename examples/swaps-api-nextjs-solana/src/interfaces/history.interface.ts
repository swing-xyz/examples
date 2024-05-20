export interface Transaction {
  type?:
    | "swap"
    | "deposit"
    | "withdraw"
    | "claim"
    | "custom_contract"
    | null
    | undefined;
  status:
    | "Submitted"
    | "Pending Source Chain"
    | "Pending Destination Chain"
    | "Completed"
    | "Refund Required"
    | "Refunded"
    | "Failed Source Chain"
    | "Failed Destination Chain"
    | "Fallback"
    | "Not Sent"
    | "Claim Required";
  reason?: string;
  bridge?: string | undefined;
  txId?: string | undefined;
  integration?: string;
  needClaim?: boolean;
  refundReason?: string;
  errorReason?: string;
  fromTokenAddress?: string;
  fromChainId?: number;
  fromChainSlug?: string;
  fromAmount?: string;
  fromAmountUsdValue?: string;
  toTokenAddress?: string;
  toChainId?: number;
  toChainSlug?: string;
  toAmount?: string;
  toAmountUsdValue?: string;
  fromChainTxHash?: string;
  toChainTxHash?: string;
  fromTokenSymbol?: string;
  toTokenSymbol?: string;
  fromUserAddress?: string;
  toUserAddress?: string;
  txStartedTimestamp?: number;
  txCompletedTimestamp?: number;
  updatedAt?: string;
  createdAt?: string;
  fallbackTokenAddress?: string;
  fallbackAmount?: string;
  id?: number;
  projectId?: string;
}

export interface TransactionResponseAPIResponse {
  transactions?: Transaction[] | undefined;
}

export interface TransactionQueryParams {
  userAddress: string;
}
