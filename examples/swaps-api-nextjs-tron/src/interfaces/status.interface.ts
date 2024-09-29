export interface TransactionStatusAPIResponse {
  type?:
    | "swap"
    | "deposit"
    | "withdraw"
    | "claim"
    | "custom_contract"
    | null
    | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  status: "Pending" | "Success" | "Failed" | any;
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
  id?: string;
  projectId?: string;
}

export interface TransactionStatusParams {
  id: string;
  txHash?: string;
}
