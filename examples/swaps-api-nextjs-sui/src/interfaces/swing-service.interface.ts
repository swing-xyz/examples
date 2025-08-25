import {
  AllowanceQueryParams,
  AllowanceAPIResponse,
} from "./allowance.interface";
import {
  ApprovalTxDataQueryParams,
  ApprovalTxDataAPIResponse,
} from "./approval.interface";
import { ChainsQueryParams, Chain } from "./chain.interface";
import {
  TransactionQueryParams,
  TransactionResponseAPIResponse,
} from "./history.interface";
import { QuoteAPIResponse, QuoteQueryParams } from "./quote.interface";
import {
  SendTransactionPayload,
  SendTransactionApiResponse,
} from "./send.interface";
import {
  TransactionStatusParams,
  TransactionStatusAPIResponse,
} from "./status.interface";
import { TokenQueryParams, Token } from "./token.interface";

export interface ISwingServiceAPI {
  getQuoteRequest(
    queryParams: QuoteQueryParams,
  ): Promise<QuoteAPIResponse | undefined>;
  getAllowanceRequest(
    queryParams: AllowanceQueryParams,
  ): Promise<AllowanceAPIResponse | undefined>;
  getApprovalTxDataRequest(
    queryParams: ApprovalTxDataQueryParams,
  ): Promise<ApprovalTxDataAPIResponse | undefined>;
  getChainsRequest(
    queryParams: ChainsQueryParams,
  ): Promise<Chain[] | undefined>;
  getTokensRequest(queryParams: TokenQueryParams): Promise<Token[] | undefined>;
  getTransationHistoryRequest(
    queryParams: TransactionQueryParams,
  ): Promise<TransactionResponseAPIResponse | undefined>;
  getTransationStatusRequest(
    queryParams: TransactionStatusParams,
  ): Promise<TransactionStatusAPIResponse | undefined>;
  sendTransactionRequest(
    payload: SendTransactionPayload,
  ): Promise<SendTransactionApiResponse | undefined>;
}
