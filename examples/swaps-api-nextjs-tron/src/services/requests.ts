import { SwingSDK } from "@swing.xyz/sdk";
import {
  AllowanceAPIResponse,
  AllowanceQueryParams,
} from "interfaces/allowance.interface";
import {
  ApprovalTxDataAPIResponse,
  ApprovalTxDataQueryParams,
} from "interfaces/approval.interface";
import { Chain, ChainsQueryParams } from "interfaces/chain.interface";
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
import { ISwingServiceAPI } from "interfaces/swing-service.interface";
import { Token, TokenQueryParams } from "interfaces/token.interface";

const projectId = "replug";

export class SwingServiceAPI implements ISwingServiceAPI {
  private readonly swingSDK: SwingSDK;

  constructor() {
    this.swingSDK = new SwingSDK({
      projectId: "replug",
      // environment: 'testnet',
      debug: true,
    });
  }

  async getQuoteRequest(
    queryParams: QuoteQueryParams,
  ): Promise<QuoteAPIResponse | undefined> {
    try {
      const response = await this.swingSDK.crossChainAPI.GET(
        "/v0/transfer/quote",
        {
          params: {
            query: queryParams,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching quote:", error);
      throw error;
    }
  }

  async getAllowanceRequest(
    queryParams: AllowanceQueryParams,
  ): Promise<AllowanceAPIResponse | undefined> {
    try {
      const response = await this.swingSDK.crossChainAPI.GET(
        "/v0/transfer/allowance",
        {
          params: {
            query: queryParams,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching allowance:", error);
      throw error;
    }
  }

  async getApprovalTxDataRequest(
    queryParams: ApprovalTxDataQueryParams,
  ): Promise<ApprovalTxDataAPIResponse | undefined> {
    try {
      const response = await this.swingSDK.crossChainAPI.GET(
        "/v0/transfer/approve",
        {
          params: {
            query: queryParams,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching approval:", error);
      throw error;
    }
  }

  async getChainsRequest(
    queryParams: ChainsQueryParams,
  ): Promise<Chain[] | undefined> {
    try {
      const response = await this.swingSDK.platformAPI.GET("/chains", {
        params: {
          query: queryParams,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching approval:", error);
      throw error;
    }
  }

  async getTokensRequest(
    queryParams: TokenQueryParams,
  ): Promise<Token[] | undefined> {
    try {
      const response = await this.swingSDK.platformAPI.GET("/tokens", {
        params: {
          query: queryParams,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching approval:", error);
      throw error;
    }
  }

  async getTransationHistoryRequest(
    queryParams: TransactionQueryParams,
  ): Promise<TransactionResponseAPIResponse | undefined> {
    try {
      const response = await this.swingSDK.crossChainAPI.GET(
        "/v0/transfer/history",
        {
          params: {
            query: queryParams,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching transaction status:", error);

      throw error;
    }
  }

  async getTransationStatusRequest(
    queryParams: TransactionStatusParams,
  ): Promise<TransactionStatusAPIResponse | undefined> {
    try {
      const response = await this.swingSDK.platformAPI.GET(
        "/projects/{projectId}/transactions/{transactionId}",
        {
          params: {
            path: {
              transactionId: queryParams.id,
              projectId,
            },
            query: {
              txHash: queryParams.txHash,
            },
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching transaction status:", error);
      throw error;
    }
  }

  async sendTransactionRequest(
    payload: SendTransactionPayload,
  ): Promise<SendTransactionApiResponse | undefined> {
    try {
      const response = await this.swingSDK.crossChainAPI.POST(
        "/v0/transfer/send",
        {
          body: payload,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    }
  }

  get isSDKConnected() {
    return this.swingSDK.isReady;
  }

  get swingSdk(): null | this {
    if (this.isSDKConnected) {
      return this;
    }

    return null;
  }
}
