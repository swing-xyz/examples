import axios from "axios";
import {
  AllowanceAPIResponse,
  AllowanceQueryParams,
} from "interfaces/allowance.interface";
import {
  ApprovalTxDataAPIResponse,
  ApprovalTxDataQueryParams,
} from "interfaces/approval.interface";
import {
  ChainsAPIResponse,
  ChainsQueryParams,
} from "interfaces/chain.interface";
import {
  TransactionQueryParams,
  TransactionResponseAPIResponse,
} from "interfaces/history.interface";
import { QuoteAPIResponse, QuoteQueryParams } from "interfaces/quote.interface";
import {
  SendTransactionApiResponse,
  SendTransactionPayload,
} from "interfaces/send.interface";
import {
  TransactionStatusAPIResponse,
  TransactionStatusParams,
} from "interfaces/status.interface";
import { TokenAPIResponse, TokenQueryParams } from "interfaces/token.interface";

const baseUrl = "https://swap.prod.swing.xyz/v0";
const projectId = "replug";

export const getQuoteRequest = async (
  queryParams: QuoteQueryParams,
): Promise<QuoteAPIResponse> => {
  try {
    const response = await axios.get<QuoteAPIResponse>(
      `${baseUrl}/transfer/quote`,
      { params: { ...queryParams, projectId } },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching quote:", error);
    throw error;
  }
};

export const getAllowanceRequest = async (
  queryParams: AllowanceQueryParams,
): Promise<AllowanceAPIResponse> => {
  try {
    const response = await axios.get<AllowanceAPIResponse>(
      `${baseUrl}/transfer/allowance`,
      { params: { ...queryParams, projectId } },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching allowance:", error);
    throw error;
  }
};

export const getApprovalTxDataRequest = async (
  queryParams: ApprovalTxDataQueryParams,
): Promise<ApprovalTxDataAPIResponse> => {
  try {
    const response = await axios.get<ApprovalTxDataAPIResponse>(
      `${baseUrl}/transfer/approve`,
      { params: { ...queryParams, projectId } },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching approval:", error);
    throw error;
  }
};

export const getChainsRequest = async (
  queryParams: ChainsQueryParams,
): Promise<ChainsAPIResponse> => {
  try {
    const response = await axios.get<ChainsAPIResponse>(
      `https://platform.swing.xyz/api/v1/projects/${projectId}/chains`,
      { params: queryParams },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching approval:", error);
    throw error;
  }
};

export const getTokensRequest = async (
  queryParams: TokenQueryParams,
): Promise<TokenAPIResponse> => {
  try {
    const response = await axios.get<TokenAPIResponse>(
      `https://platform.swing.xyz/api/v1/tokens`,
      { params: queryParams },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching approval:", error);
    throw error;
  }
};

export const getTransationHistory = async (
  queryParams: TransactionQueryParams,
): Promise<TransactionResponseAPIResponse> => {
  try {
    const response = await axios.get<TransactionResponseAPIResponse>(
      `${baseUrl}/transfer/history`,
      { params: { ...queryParams, projectId } },
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching transaction status:", error);

    throw error;
  }
};

export const getTransationStatus = async (
  queryParams: TransactionStatusParams,
): Promise<TransactionStatusAPIResponse> => {
  try {
    const response = await axios.get<TransactionStatusAPIResponse>(
      `${baseUrl}/transfer/status`,
      { params: { ...queryParams, projectId } },
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching transaction status:", error);

    throw error;
  }
};

export const sendTransactionRequest = async (
  payload: SendTransactionPayload,
): Promise<SendTransactionApiResponse> => {
  try {
    const response = await axios.post<SendTransactionApiResponse>(
      `${baseUrl}/transfer/send`,
      { ...payload, projectId },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw error;
  }
};
