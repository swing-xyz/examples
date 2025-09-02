import { Chain } from "./quote.interface";

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
  
  export interface ApproveQueryParams {
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
  
  export interface ApproveAPIResponse {
    tx: ApproveTransaction[];
    fromChain: Chain;
  }
  
  interface ApproveTransaction {
    data: string;
    from: string;
    to: string;
  }