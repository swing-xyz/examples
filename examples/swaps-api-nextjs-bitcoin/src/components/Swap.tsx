"use client";

import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";
import { useConnect } from "@thirdweb-dev/react";
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

import { xdefiWallet } from "@thirdweb-dev/react";
const xDefiConfig = xdefiWallet(); //<- For connecting to a bitcoin supported wallet.

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

const pendingStatuses = [
  "Submitted",
  "Not Sent",
  "Pending Source Chain",
  "Pending Destination Chain",
];

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
    useState<TransactionStatusAPIResponse | null>();

  const connect = useConnect();
  const address = useAddress();

  const connectionStatus = useConnectionStatus();
  const walletAddress = useAddress();
  const signer = useSigner();

  const { toast } = useToast();

  const sendInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!xDefiConfig?.isInstalled!()) {
      console.log("not installed");
      toast({
        variant: "destructive",
        title: "xDefi Wallet not installed",
        description: "Please install xDefi wallet in your browser",
      });
    }
  }, []);

  async function connectWallet(chainId?: number) {
    try {
      // Connect to xDefiConfig
      await connect(xDefiConfig, { chainId });

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
        title: "Wallet connection error",
        description: (error as Error).message,
      });
    }
  }

  async function getTransStatus(
    transId: string,
    txHash: string,
  ): Promise<TransactionStatusAPIResponse> {
    try {
      const transactionStatus = await getTransationStatus({
        id: transId,
        txHash,
      });

      setTransStatus(transactionStatus);

      return transactionStatus!;
    } catch (e) {
      return { status: "Submitted" };
    }
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
      toast({
        title: "Transaction Successful",
        description: `Bridge Successful`,
      });
    }

    (sendInputRef.current as HTMLInputElement).value = "0.000";
  }

  function switchTransferParams() {
    const tempTransferParams: TranferParams = Object.create(transferParams);

    const newTransferParams: TranferParams = {
      tokenAmount: "0",
      fromChain: tempTransferParams.toChain,
      tokenSymbol: tempTransferParams.toTokenSymbol!,
      fromUserAddress: tempTransferParams.toUserAddress!,
      fromTokenAddress: tempTransferParams.toTokenAddress!,
      fromTokenIconUrl: tempTransferParams.toTokenIconUrl,
      fromChainDecimal: tempTransferParams.toChainDecimal,
      toTokenAddress: tempTransferParams.fromTokenAddress,
      toTokenSymbol: tempTransferParams.tokenSymbol,
      toChain: tempTransferParams.fromChain,
      toTokenIconUrl: tempTransferParams.fromTokenIconUrl!,
      toUserAddress: tempTransferParams.fromUserAddress,
      toChainDecimal: tempTransferParams.fromChainDecimal,
    };

    setTransferRoute(null);
    setTransferParams(newTransferParams);

    (sendInputRef.current as HTMLInputElement).value = "0.000";
  }

  async function getQuote() {
    setIsLoading(true);

    try {
      // Get a quote from the Swing API
      const quotes = await getQuoteRequest({
        fromChain: transferParams.fromChain,
        fromTokenAddress: transferParams.fromTokenAddress,
        fromUserAddress: transferParams.fromUserAddress,
        toChain: transferParams.toChain,
        tokenSymbol: transferParams.tokenSymbol,
        toTokenAddress: transferParams.toTokenAddress,
        toTokenSymbol: transferParams.toTokenSymbol,
        toUserAddress: transferParams.toUserAddress,
        tokenAmount: convertEthToWei(
          transferParams.tokenAmount,
          transferParams.fromChainDecimal,
        ),
      });

      if (!quotes?.routes.length) {
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
        data: transfer?.tx.data,
        from: transfer?.tx.from,
        to: transfer?.tx.to,
        value: transfer?.tx.value,
        gasLimit: transfer?.tx.gas,
      };

      /***
       * BITCOIN TO ETHEREUM ROUTE
       *
       * FOR BTC -> ETH Route, you must use a wallet that supports Bitcoin
       * In this excerpt, here's how to
       */

      setTransStatus({ status: "Wallet Interaction Required" });

      let txResponse;

      if (transfer?.tx.meta) {
        // For Bitcoin to ETH, the send endpoint will return an object called `meta`

        const { from, recipient, amount, memo } = transfer.tx.meta;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.xfi as any)?.bitcoin.request(
          // Here, we're prompting a users wallet using xDEFI injected SDK
          {
            method: "transfer",
            params: [
              {
                from,
                recipient,
                amount,
                memo,
              },
            ],
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error: any, result: any) => {
            console.log(error, result);

            if (error) {
              toast({
                variant: "destructive",
                title: "Something went wrong!",
                description:
                  "Swap error, please check your balance or swap config",
              });

              setIsLoading(false);
              setTransStatus(null);
            }
            txResponse = result;
            pollTransactionStatus(transfer.id.toString(), txResponse);
            console.log(txResponse);
          },
        );
      } else {
        txResponse = await signer?.sendTransaction(txData);
        pollTransactionStatus(transfer?.id?.toString()!, txResponse?.hash!);
        const receipt = await txResponse?.wait();
        console.log("Transaction receipt:", receipt);
      }

      // Wait for the transaction to be mined
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
    <div className="flex w-full flex-col gap-y-4 rounded-2xl border-8 border-cyan-200 bg-cyan-400 px-5 py-7 lg:w-auto">
      <div className="flex w-full flex-col justify-center gap-3 sm:flex-row">
        <div className="flex-2 flex w-full flex-col items-center space-x-2 sm:flex-row lg:w-auto">
          <div className="flex w-full">
            <div className="w-full space-y-1 rounded-xl border-8 border-cyan-500 bg-zinc-900 p-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h4 className="w-full text-[11px] font-bold text-zinc-300">
                    Send
                  </h4>
                  <div className="flex items-center justify-between">
                    <input
                      aria-label="deposit"
                      className="m-0 h-auto w-full border-none bg-transparent p-0 text-white placeholder:m-0 placeholder:p-0 placeholder:text-lg focus:border-none focus:ring-0"
                      placeholder={"0"}
                      defaultValue={transferParams.tokenAmount}
                      ref={sendInputRef}
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
                    className="h-6 w-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-zinc-200 p-1">
            <LiaExchangeAltSolid
              className="h-8 w-8 cursor-pointer rounded-2xl font-bold text-zinc-400 transition-colors ease-in-out hover:text-zinc-950"
              onClick={() => switchTransferParams()}
            />
          </div>
          <div className="flex w-full">
            <div className="w-full space-y-1 rounded-xl border-8 border-cyan-500 bg-zinc-900 p-3 lg:w-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={transferParams.toTokenIconUrl}
                    className="h-6 w-6"
                  />
                  <div className="text-sm text-white">
                    {transferParams.toChain}
                  </div>
                </div>
                <div className="flex flex-col">
                  <h4 className="w-full text-right text-[11px] font-bold text-zinc-300">
                    You get
                  </h4>
                  <div className="flex items-center justify-between">
                    <input
                      aria-label="receive"
                      className="m-0 h-auto w-full border-none bg-transparent p-0 text-right text-white placeholder:m-0 placeholder:p-0 placeholder:text-lg focus:border-none focus:ring-0"
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
                  className="flex cursor-pointer items-center justify-center rounded-2xl bg-zinc-600 
                                            px-3 py-2 text-sm font-semibold text-white
                                            outline-2 outline-offset-2 transition-colors hover:bg-gray-900 
                                            active:bg-gray-800 active:text-white/80"
                >
                  {transStatus?.status ? "View Transaction" : "Start Transfer"}
                </PopoverTrigger>
                <PopoverContent className="min-w-[300px] rounded-2xl">
                  <div className="space-y-2">
                    <div className="text-muted-foreground flex flex-col space-y-4 text-sm">
                      <Label htmlFor="width" className="text-zinc-700">
                        Enter your {transferParams.toChain} wallet address
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
                        <div className="flex min-h-[30px] w-full flex-col rounded bg-zinc-700 p-2 text-white">
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
                          "flex cursor-pointer items-center rounded-xl bg-zinc-600",
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
                  "flex cursor-pointer items-center bg-zinc-600 sm:rounded",
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
            className={clsx("flex cursor-pointer items-center sm:rounded", {
              "opacity-60": isLoading,
            })}
            disabled={isLoading}
            onClick={() => connectWallet()}
          >
            Connect
          </Button>
        )}
      </div>
      <div className="m-h-[20px] flex min-w-full rounded-xl border-8 border-cyan-500 bg-black p-3">
        <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="w-full rounded bg-zinc-700 p-2">
            <label className="block text-xs font-medium text-zinc-200">
              From
            </label>
            <div className="font-medium capitalize text-zinc-400">
              {transferParams.fromChain} / {transferParams.tokenSymbol}
            </div>
          </div>

          <div className="w-full rounded bg-zinc-700 p-2">
            <label className="block text-xs font-medium text-zinc-200">
              To
            </label>
            <div className="font-medium capitalize text-zinc-400">
              {transferParams.toChain} / {transferParams.toTokenSymbol}
            </div>
          </div>

          <div className="w-full rounded bg-zinc-700 p-2">
            <label className="block text-xs font-medium text-zinc-200">
              Gas Fee
            </label>
            <div className="font-medium capitalize text-green-200">
              {formatUSD(transferRoute?.gasUSD! ?? 0)}
            </div>
          </div>

          <div className="w-full rounded bg-zinc-700 p-2">
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
