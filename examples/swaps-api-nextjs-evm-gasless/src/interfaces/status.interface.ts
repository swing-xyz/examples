export interface TransactionStatusAPIResponse {
  status: string;
  refundReason?: string;
  errorReason?: string | null;
  needClaim?: boolean;
  bridge?: string;
  txId?: string;
  txStartedTimestamp?: number;
  txCompletedTimestamp?: number;
  fromUserAddress?: string;
  toUserAddress?: string;
  fromTokenAddress?: string;
  fromAmount?: string;
  fromAmountUsdValue?: string;
  fromChainId?: number;
  fromChainSlug?: string;
  fromChainTxHash?: string;
  toTokenAddress?: string;
  toAmount?: string;
  toAmountUsdValue?: string;
  toChainId?: number;
  toChainSlug?: string;
  toChainTxHash?: string;
  updatedAt?: string;
  createdAt?: string;
  fromTokenSymbol?: string;
  toTokenSymbol?: string;
  transferStep?: string | null;
  transferStatus?: string | null;
  fallbackTokenAddress?: string | null;
  contractCall?: boolean;
  toContractCallAddress?: string | null;
  toContractCallData?: string | null;
  toContractCallTokenAddress?: string | null;
  toContractCallApprovalAddress?: string | null;
  toContractCallGasLimit?: string | null;
  integration?: string;
  type?: string;
  bridgeFeeUsdValue?: string;
  bridgeFeeInNativeTokenUsdValue?: string | null;
  destinationTxFeeUsdValue?: string | null;
  gasUsage?: string;
  gasUsageUsdValue?: string;
  partnerShare?: string;
  partnerShareUsdValue?: string;
  swingShare?: string;
  swingShareUsdValue?: string;
  id?: number;
}

export interface TransactionStatusParams {
  id: string;
  txHash?: string;
}
