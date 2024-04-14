"use client";

import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { useConnect, metamaskWallet } from "@thirdweb-dev/react";
import {
  useConnectionStatus,
  useAddress,
  useSigner,
} from "@thirdweb-dev/react";
import { LiaExchangeAltSolid } from "react-icons/lia";
import { QuoteQueryParams, Route } from "interfaces/quote.interface";
import {
  getQuoteRequest,
  getTransationStatus,
  sendTransactionRequest,
} from "services/requests";
import { convertEthToWei, convertWeiToEth } from "utils/ethToWei";
import { Popover, PopoverContent, PopoverTrigger } from "components/ui/popover";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useToast } from "components/ui/use-toast";
import { TransactionStatusAPIResponse } from "interfaces/status.interface";
import { AxiosError } from "axios";

const walletConfig = metamaskWallet();

// import { xdefiWallet } from "@thirdweb-dev/react";
// const xDefiConfig = xdefiWallet(); <- For connecting to a bitcoin supported wallet.

interface ChainDecimals {
  fromChainDecimal?: number;
  toChainDecimal?: number;
}

interface ChainIcons {
  fromTokenIconUrl?: string;
  toTokenIconUrl?: string;
}

type TranferParams = QuoteQueryParams & ChainDecimals & ChainIcons;

const defaultTransferParams: TranferParams = {
  tokenAmount: "1",
  fromChain: "ethereum",
  fromUserAddress: "",
  fromTokenAddress: "0x0000000000000000000000000000000000000000",
  fromTokenIconUrl:
    "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/PNG/eth.png",
  fromChainDecimal: 18,
  tokenSymbol: "ETH",
  toTokenAddress: "btc",
  toTokenSymbol: "BTC",
  toChain: "bitcoin",
  toTokenIconUrl:
    "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/PNG/btc.png",
  toUserAddress: "bc1qeegt8mserjpwmaylfmprfswcx6twa4psusas8x", // enter your bitcoin wallet here
  toChainDecimal: 8,
};

const pendingStatuses = ["Submitted", "Not Sent", "Pending Source Chain", "Pending Destination Chain"];

const transactionPollingDuration = 10000;

const Swap = () => {
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState("");
  const [transferParams, setTransferParams] = useState<TranferParams>(
    defaultTransferParams,
  );

  const [recipientAddress] = useState("");

  const [transferRoute, setTransferRoute] = useState<Route | null>(null);
  const [transStatus, setTransStatus] =
    useState<TransactionStatusAPIResponse>();

  const connect = useConnect();
  const address = useAddress();

  const connectionStatus = useConnectionStatus();
  const walletAddress = useAddress();
  const signer = useSigner();

  const { toast } = useToast();

  useEffect(() => {
    setTransferParams((prev) => {
      return {
        ...prev,
        fromUserAddress: walletAddress!,
      };
    });
  }, [walletAddress]);

  useEffect(() => {
    setTransferParams((prev) => {
      return {
        ...prev,
        toUserAddress: recipientAddress.length
          ? recipientAddress
          : transferParams.toUserAddress,
      };
    });
  }, [recipientAddress]);

  async function connectWallet(chainId?: number) {
    try {
      // Connect to MetaMask
      await connect(walletConfig, { chainId });

      // Connect wallet signer to Swing SDK
      const walletAddress = address;

      setTransferParams((prev) => {
        return {
          ...prev,
          fromUserAddress: walletAddress!,
        };
      });
    } catch (error) {
      console.error("Connect Wallet Error:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong!",
        description: (error as Error).message,
      });
    }
  }

  async function getTransStatus(transId: string, txHash: string) {
    const transactionStatus = await getTransationStatus({
      id: transId,
      txHash,
    });

    setTransStatus(transactionStatus);

    return transactionStatus;
  }

  async function pollTransactionStatus(transId: string, txHash: string) {
    const transactionStatus = await getTransStatus(transId, txHash);

    if (pendingStatuses.includes(transactionStatus?.status)) {
      setTimeout(
        () => pollTransactionStatus(transId, txHash),
        transactionPollingDuration,
      );
    } else {
      setTransferRoute(null);
    }
  }

  async function getQuote() {
    setIsLoading(true);

    try {
      // Get a quote from the Swing API
      const quotes = await getQuoteRequest({
        ...transferParams,
        tokenAmount: convertEthToWei(
          transferParams.tokenAmount,
          transferParams.fromChainDecimal,
        ),
      });

      if (!quotes.routes.length) {
        // setError("");
        toast({
          variant: "destructive",
          title: "No routes found",
          description: "No routes available. Try increasing the send amount.",
        });
        setIsLoading(false);
        return;
      }

      setTransferRoute(quotes.routes[0]!);

      console.log(transferRoute);
    } catch (error) {
      console.error("Quote Error:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong!",
        description: (error as Error).message,
      });
    }

    setIsLoading(false);
  }

  async function startTransfer() {
    if (!transferRoute) {
      toast({
        variant: "destructive",
        title: "Something went wrong!",
        description: "Please get a route first before attempting a transaction",
      });
      return;
    }

    console.log(transferParams.toUserAddress);

    //TODO: Check Chain and Switch

    setIsLoading(true);

    try {
      const transfer = await sendTransactionRequest({
        fromChain: transferParams.fromChain,
        fromTokenAddress: transferParams.fromTokenAddress,
        fromUserAddress: transferParams.fromUserAddress,
        tokenSymbol: transferParams.tokenSymbol,

        toTokenAddress: transferParams.toTokenAddress!,
        toChain: transferParams.toChain,
        toTokenAmount: transferRoute.quote.amount,
        toTokenSymbol: transferParams.toTokenSymbol!,
        toUserAddress: transferParams.toUserAddress!,

        tokenAmount: convertEthToWei(
          transferParams.tokenAmount,
          transferParams.fromChainDecimal,
        ),
        route: transferRoute.route,
        type: "swap",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txData: any = {
        data: transfer.tx.data,
        from: transfer.tx.from,
        to: transfer.tx.to,
        value: transfer.tx.value,
        gasLimit: transfer.tx.gas,
      };

      /***
       * BITCOIN TO ETHEREUM ROUTE
       *
       * FOR BTC -> ETH Route, you must use a wallet that supports Bitcoin
       * In this excerpt, here's how to
       */

      // if (transfer.tx.meta) { <- For Bitcoin to ETH, the send endpoint will return an object called `meta`
      //   const { from, recipient, amount, memo } = transfer.tx.meta;

      //   (window.xfi as any)?.bitcoin.request( <- Here, we're prompting a users wallet using xDEFI injected SDK
      //     {
      //       method: "transfer",
      //       params: [
      //         {
      //           from,
      //           recipient,
      //           amount,
      //           memo,
      //         },
      //       ],
      //     },
      //     (error: any, result: any) => {
      //       console.debug(error, result);
      //     },
      //   );

      //   txData = {
      //     from,
      //     to: recipient,
      //     amount: amount,
      //     data: memo,
      //   };
      // } else {

      // }

      setTransStatus({ status: "Wallet Interaction Required" });

      const txResponse = await signer?.sendTransaction(txData);

      pollTransactionStatus(transfer.id.toString(), txResponse?.hash!);

      // Wait for the transaction to be mined

      const receipt = await txResponse?.wait();
      console.log("Transaction receipt:", receipt);
    } catch (error) {
      console.error("Transfer Error:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong!",
        description:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          `${(error as AxiosError & any)?.response?.data?.error} : ${(error as AxiosError & any)?.response?.data?.message}` ??
          (error as Error).message ??
          "Something went wrong",
      });
    }

    setIsLoading(false);
  }

  return (
    <div className="flex flex-col gap-y-4 lg:w-auto w-full px-5 py-7 bg-cyan-400 rounded-2xl border-8 border-cyan-200">
      <div className="w-full flex flex-col sm:flex-row justify-center gap-3">
        <div className="flex flex-col sm:flex-row lg:w-auto w-full items-center space-x-2 flex-2">
          <div className="flex w-full">
            <div className="w-full border-8 border-cyan-500 space-y-1 rounded-xl bg-zinc-900 p-3">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <h4 className="w-full text-[11px] font-bold text-zinc-300">
                    Send
                  </h4>
                  <div className="flex justify-between items-center">
                    <input
                      aria-label="deposit"
                      className="border-none text-white w-full h-auto bg-transparent focus:border-none focus:ring-0 placeholder:m-0 placeholder:p-0 placeholder:text-lg p-0 m-0"
                      placeholder={"0"}
                      defaultValue={transferParams.tokenAmount}
                      onChange={(e) => {
                        setTransferRoute(null); // Reset transfer route
                        setTransferParams((prev) => ({
                          ...prev,
                          tokenAmount: e.target.value,
                        }));
                      }}
                      type="number"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-white">
                    {transferParams.fromChain}
                  </div>
                  <img
                    src={transferParams.fromTokenIconUrl}
                    className="w-6 h-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="p-1 bg-zinc-200 rounded-2xl">
            <LiaExchangeAltSolid className="rounded-2xl w-8 h-8 font-bold text-black" />
          </div>
          <div className="flex w-full">
            <div className="lg:w-auto w-full border-8 border-cyan-500 space-y-1 rounded-xl bg-zinc-900 p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img
                    src={transferParams.toTokenIconUrl}
                    className="w-6 h-6"
                  />
                  <div className="text-sm text-white">
                    {transferParams.toChain}
                  </div>
                </div>
                <div className="flex flex-col">
                  <h4 className="w-full text-[11px] font-bold text-zinc-300 text-right">
                    You get
                  </h4>
                  <div className="flex justify-between items-center">
                    <input
                      aria-label="receive"
                      className="border-none text-white text-right w-full h-auto bg-transparent focus:border-none focus:ring-0 placeholder:m-0 placeholder:p-0 placeholder:text-lg p-0 m-0"
                      placeholder={"0"}
                      value={
                        convertWeiToEth(
                          transferRoute?.quote.amount! ?? 0,
                          transferParams.toChainDecimal,
                        ) || 0
                      }
                      onChange={(e) => {
                        setTransferRoute(null); // Reset transfer route
                        setTransferParams((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }));
                      }}
                      type="number"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {connectionStatus === "connected" ? (
          <>
            {transferRoute ? (
              <Popover defaultOpen={false}>
                <PopoverTrigger
                  className="inline-flex justify-center rounded-2xl py-2 px-3 text-sm font-semibold 
                                            outline-2 outline-offset-2 transition-colors bg-gray-800 text-white hover:bg-gray-900
                                            flex items-center cursor-pointer bg-zinc-600 
                                            active:bg-gray-800 active:text-white/80"
                >
                  Start Transfer
                </PopoverTrigger>
                <PopoverContent className="rounded-2xl min-w-[300px]">
                  <div className="space-y-2">
                    <div className="flex flex-col space-y-4 text-sm text-muted-foreground">
                      <Label htmlFor="width" className="text-zinc-700">
                        Enter your Bitcoin wallet address
                      </Label>
                      <Input
                        id="width"
                        defaultValue=""
                        placeholder="bc1qeegt8mserjpwmaylfmprfswcx6twa4psusas8x"
                        className="col-span-2 h-8 rounded focus:border-none"
                        onChange={(e) => {
                          setTransferParams((prev) => ({
                            ...prev,
                            toUserAddress: e.target.value,
                          }));
                        }}
                      />
                      {transStatus ? (
                        <div className="flex flex-col w-full min-h-[30px] bg-zinc-700 text-white p-2 rounded">
                          <h4 className="text-md">Transaction Processing</h4>
                          <div className="flex items-center text-zinc-200">
                            {transStatus.status}{" "}
                            {transStatus.status !== "Completed" ? (
                              <FontAwesomeIcon
                                className="ml-2"
                                icon={faCircleNotch}
                                spin
                              />
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                      ) : (
                        <></>
                      )}
                      <Button
                        className={clsx(
                          "flex items-center cursor-pointer bg-zinc-600 rounded-xl",
                          {
                            "opacity-60": isLoading,
                          },
                        )}
                        disabled={isLoading || !recipientAddress.length}
                        onClick={() => startTransfer()}
                      >
                        Send
                        {isLoading && (
                          <FontAwesomeIcon
                            className="ml-2"
                            icon={faCircleNotch}
                            spin
                          />
                        )}
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                className={clsx(
                  "flex items-center cursor-pointer bg-zinc-600 sm:rounded",
                  {
                    "opacity-60": isLoading,
                  },
                )}
                disabled={isLoading}
                onClick={() => getQuote()}
              >
                Get Quote
                {isLoading && (
                  <FontAwesomeIcon className="ml-2" icon={faCircleNotch} spin />
                )}
              </Button>
            )}
          </>
        ) : (
          <Button
            className={clsx("flex items-center cursor-pointer sm:rounded", {
              "opacity-60": isLoading,
            })}
            disabled={isLoading}
            onClick={() => connectWallet()}
          >
            Connect
          </Button>
        )}
      </div>
      <div className="flex bg-black min-w-full rounded-xl m-h-[20px] p-3 border-8 border-cyan-500">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full bg-zinc-700 p-2 rounded">
            <label className="block text-xs font-medium text-zinc-200">
              From
            </label>
            <div className="font-medium capitalize text-zinc-400">
              {transferParams.fromChain} / {transferParams.tokenSymbol}
            </div>
          </div>

          <div className="w-full bg-zinc-700 p-2 rounded">
            <label className="block text-xs font-medium text-zinc-200">
              To
            </label>
            <div className="font-medium capitalize text-zinc-400">
              {transferParams.toChain} / {transferParams.toTokenSymbol}
            </div>
          </div>

          <div className="w-full bg-zinc-700 p-2 rounded">
            <label className="block text-xs font-medium text-zinc-200">
              Gas Fee
            </label>
            <div className="font-medium capitalize text-green-200">
              {formatUSD(transferRoute?.gasUSD! ?? 0)}
            </div>
          </div>

          <div className="w-full bg-zinc-700 p-2 rounded">
            <label className="block text-xs font-medium text-zinc-200">
              Total
            </label>
            <div className="font-medium capitalize text-green-200">
              {formatUSD(transferRoute?.quote?.amountUSD! ?? 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatUSD(amount: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
  }).format(Number(amount));
}

export default Swap;
