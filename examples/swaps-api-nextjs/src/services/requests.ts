import axios from "axios";
import { QuoteAPIResponse, QuoteQueryParams } from "interfaces/quote.interface";
import {
  SendTransactionApiResponse,
  SendTransactionPayload,
} from "interfaces/send.interface";

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

// https://swap.dev.swing.xyz/v0/transfer/quote?

// fromChain=bitcoin
// tokenSymbol=BTC
// fromTokenAddress=btc
// fromUserAddress=bc1qgnpnfcke88qqwuv2hy5xnul5phu4qq903kkhxs
// toChain=ethereum
// toTokenSymbol=ETH
// toTokenAddress=0x0000000000000000000000000000000000000000
// toUserAddress=0x805EBB94084e01da57c4bc70B6FE414aF9148596
// tokenAmount=100000

// https://swap.prod.swing.xyz/v0/transfer/quote?

// fromChain=bitcoin
// tokenSymbol=BTC
// fromTokenAddress=btc
// fromUserAddress=0x018c15DA1239B84b08283799B89045CD476BBbBb
// toChain=ethereum
// toTokenSymbol=ETH
// toTokenAddress=0x0000000000000000000000000000000000000000
// toUserAddress=0x018c15DA1239B84b08283799B89045CD476BBbBb
// tokenAmount=100000
// projectId=replug
