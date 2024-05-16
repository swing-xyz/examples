export interface AllowanceQueryParams {
  bridge: string;
  fromAddress: string;
  fromChain: string;
  toChain: string;
  tokenAddress: string;
  tokenSymbol: string;
  toTokenSymbol: string;
  toTokenAddress: string;
  contractCall: boolean;
}

export interface AllowanceAPIResponse {
  allowance: string;
}
