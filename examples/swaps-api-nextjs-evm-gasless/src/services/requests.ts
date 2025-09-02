import axios from "axios";
import { QuoteAPIResponse, QuoteQueryParams } from "interfaces/quote.interface";
import {
  SendTransactionApiResponse,
  SendTransactionPayload,
} from "interfaces/send.interface";
import {
  TransactionStatusAPIResponse,
  TransactionStatusParams,
} from "interfaces/status.interface";
import {
  AllowanceQueryParams,
  AllowanceAPIResponse,
  ApproveQueryParams,
  ApproveAPIResponse,
} from "interfaces/allowance.interface";

const baseUrl = "https://swap.prod.swing.xyz/v0";
const projectId = "replug";

export const getQuoteRequest = async (
  queryParams: QuoteQueryParams,
): Promise<QuoteAPIResponse> => {
  try {
    const response = await axios.get<QuoteAPIResponse>(
      `${baseUrl}/transfer/quote`,
      { params: { ...queryParams, projectId, mode: "gasless", debug: true } },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching quote:", error);
    throw error;
  }
};

export const getTransationStatus = async (
  statusParams: TransactionStatusParams,
): Promise<TransactionStatusAPIResponse> => {
  try {
    const response = await axios.get<TransactionStatusAPIResponse>(
      `${baseUrl}/transfer/status`,
      { params: { ...statusParams, projectId } },
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
      { ...payload, projectId, mode: "gasless" },
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

export const getApproveRequest = async (
  queryParams: ApproveQueryParams,
): Promise<ApproveAPIResponse> => {
  try {
    const response = await axios.get<ApproveAPIResponse>(
      `${baseUrl}/transfer/approve`,
      { params: { ...queryParams, projectId } },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching approve transaction:", error);
    throw error;
  }
};