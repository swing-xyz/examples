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

export const getTransationStatus = async (
  statusParams: TransactionStatusParams,
): Promise<TransactionStatusAPIResponse> => {
  try {
    const response = await axios.get<TransactionStatusAPIResponse>(
      `${baseUrl}/transfer/status`,
      { params: { ...statusParams, projectId } },
    );

    if (response.status === 404) {
      return { status: "Not Found " };
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching transaction status:", error);

    return { status: "Transaction Failed" };
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
