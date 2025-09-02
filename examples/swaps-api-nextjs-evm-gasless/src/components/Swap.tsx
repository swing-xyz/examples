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
  useBalance,
} from "@thirdweb-dev/react";
import { LiaExchangeAltSolid } from "react-icons/lia";
import { QuoteQueryParams, Route } from "interfaces/quote.interface";
import {
  getAllowanceRequest,
  getApproveRequest,
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

import { metamaskWallet } from "@thirdweb-dev/react";
const walletConfig = metamaskWallet();

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
  fromChain: "base",
  fromUserAddress: "0xE1e0992Be9902E92460AC0Ff625Dcc1c485FCF6b",
  fromTokenAddress: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  fromTokenIconUrl:
    "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/PNG/usdc.png",
  fromChainDecimal: 6,
  tokenSymbol: "USDC",
  toTokenAddress: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
  toTokenSymbol: "USDC",
  toChain: "polygon",
  toTokenIconUrl:
    "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/PNG/usdc.png",
  toUserAddress: "0xE1e0992Be9902E92460AC0Ff625Dcc1c485FCF6b",
  toChainDecimal: 6,
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
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [transStatus, setTransStatus] =
    useState<TransactionStatusAPIResponse | null>();

  const connect = useConnect();
  const address = useAddress();

  const connectionStatus = useConnectionStatus();
  const walletAddress = useAddress();
  const signer = useSigner();

  const { toast } = useToast();

  const sendInputRef = useRef<HTMLInputElement>(null);

  // Get token balance for the connected wallet
  const { data: tokenBalance } = useBalance(transferParams.fromTokenAddress);

  // Format balance with appropriate decimals
  const formatBalance = (balance: string, decimals: number) => {
    const balanceNum = parseFloat(balance) / Math.pow(10, decimals);
    return balanceNum.toFixed(4);
  };

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
    if (!walletConfig?.isInstalled!()) {
      console.log("not installed");
      toast({
        variant: "destructive",
        title: "MetaMask Wallet not installed",
        description: "Please install xDefi wallet in your browser",
      });
    }
  }, []);

  async function connectWallet(chainId?: number) {
    try {
      // Connect to xDefiConfig
      await connect(walletConfig, { chainId });

      // Connect wallet signer to Swing SDK
      const walletAddress = address;

      setTransferParams((prev) => {
        return {
          ...prev,
          fromUserAddress: walletAddress!,
          toUserAddress: walletAddress!,
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
      fromUserAddress: walletAddress!,
      fromTokenAddress: tempTransferParams.toTokenAddress!,
      fromTokenIconUrl: tempTransferParams.toTokenIconUrl,
      fromChainDecimal: tempTransferParams.toChainDecimal,
      toTokenAddress: tempTransferParams.fromTokenAddress,
      toTokenSymbol: tempTransferParams.tokenSymbol,
      toChain: tempTransferParams.fromChain,
      toTokenIconUrl: tempTransferParams.fromTokenIconUrl!,
      toUserAddress: walletAddress!,
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
        toUserAddress: transferParams.fromUserAddress,
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

      // Store all available routes
      setAvailableRoutes(quotes.routes);

      // Find best route (lowest gas cost) or default to first route
      const bestRouteIndex = quotes.routes.reduce(
        (bestIdx, route, currentIdx) => {
          const currentGasUSD = parseFloat(route.gasUSD || "0");
          const bestGasUSD = parseFloat(quotes.routes[bestIdx]?.gasUSD || "0");
          return currentGasUSD < bestGasUSD ? currentIdx : bestIdx;
        },
        0,
      );
      const defaultRouteIndex = bestRouteIndex;

      setSelectedRouteIndex(defaultRouteIndex);
      setTransferRoute(quotes.routes[defaultRouteIndex]!);

      console.log("Available routes:", quotes.routes.length);
      console.log("Selected route:", quotes.routes[defaultRouteIndex]);
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

  function handleRouteSelection(routeIndex: number) {
    setSelectedRouteIndex(routeIndex);
    setTransferRoute(availableRoutes[routeIndex]!);
    console.log("Selected route:", availableRoutes[routeIndex]);
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

    transferParams.toUserAddress = walletAddress!;
    transferParams.fromUserAddress = walletAddress!;

    setIsLoading(true);

    const tokenAmount = convertEthToWei(
      transferParams.tokenAmount,
      transferParams.fromChainDecimal,
    );

    // Chain ID mapping
    const chainIdMap: { [key: string]: string } = {
      polygon: "0x89", // 137 in hex
      base: "0x2105", // 8453 in hex
    };

    try {
      // Switch to correct chain (MetaMask will handle if already on correct chain)
      const targetChainId = chainIdMap[transferParams.fromChain];
      if (targetChainId) {
        setTransStatus({ status: "Ensuring correct network..." });

        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: targetChainId }],
          });

          console.log("Network ensured for chain:", transferParams.fromChain);

          // Brief wait for any network state changes
          await new Promise((resolve) => setTimeout(resolve, 500));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (switchError: any) {
          console.error("Chain switch error:", switchError);
          toast({
            variant: "destructive",
            title: "Network switch failed!",
            description: `Please manually switch to ${transferParams.fromChain} network`,
          });
          setIsLoading(false);
          setTransStatus(null);
          return;
        }
      }

      // Check allowance and approve if needed
      const checkAllowance = await getAllowanceRequest({
        bridge: transferRoute.quote.integration,
        fromAddress: transferParams.fromUserAddress,
        fromChain: transferParams.fromChain,
        tokenAddress: transferParams.fromTokenAddress,
        tokenSymbol: transferParams.tokenSymbol,
        toChain: transferParams.toChain,
        toTokenAddress: transferParams.toTokenAddress!,
        toTokenSymbol: transferParams.toTokenSymbol!,
        contractCall: false,
      });

      if (Number(checkAllowance?.allowance || "0") <= 0) {
        setTransStatus({
          status: "Wallet Interaction Required: Approval Token",
        });

        const getApprovalTxData = await getApproveRequest({
          tokenAmount: tokenAmount,
          bridge: transferRoute.quote.integration,
          fromAddress: transferParams.fromUserAddress,
          fromChain: transferParams.fromChain,
          tokenAddress: transferParams.fromTokenAddress,
          tokenSymbol: transferParams.tokenSymbol,
          toChain: transferParams.toChain,
          toTokenAddress: transferParams.toTokenAddress!,
          toTokenSymbol: transferParams.toTokenSymbol!,
          contractCall: false,
        });

        const txData = {
          data: getApprovalTxData?.tx?.at(0)?.data!,
          from: getApprovalTxData?.tx?.at(0)?.from!,
          to: getApprovalTxData?.tx?.at(0)?.to!,
        };

        const txResponse = await signer?.sendTransaction(txData);
        const receipt = await txResponse?.wait();
        console.log("Approval transaction receipt:", receipt);

        setTransStatus({ status: "Token allowance approved" });

        // Wait a moment for blockchain state to update
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Verify approval went through
        const verifyAllowance = await getAllowanceRequest({
          bridge: transferRoute.quote.integration,
          fromAddress: transferParams.fromUserAddress,
          fromChain: transferParams.fromChain,
          tokenAddress: transferParams.fromTokenAddress,
          tokenSymbol: transferParams.tokenSymbol,
          toChain: transferParams.toChain,
          toTokenAddress: transferParams.toTokenAddress!,
          toTokenSymbol: transferParams.toTokenSymbol!,
          contractCall: false,
        });

        console.log("Verified allowance:", verifyAllowance?.allowance);
      }

      setTransStatus({ status: "Preparing transfer..." });

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

        tokenAmount: tokenAmount,
        route: transferRoute.route,
        type: "swap",
      });

      /***
       * GASLESS TRANSACTION FLOW
       *
       * For gasless transactions, we use EIP-712 typed data signing
       * instead of sending a regular transaction
       */

      setTransStatus({ status: "Wallet Interaction Required" });

      let txResponse;

      if (
        transfer?.tx?.meta &&
        "domain" in transfer.tx.meta &&
        transfer.tx.meta.domain &&
        "types" in transfer.tx.meta &&
        transfer.tx.meta.types &&
        "value" in transfer.tx.meta &&
        transfer.tx.meta.value
      ) {
        // For gasless transactions, the send endpoint returns EIP-712 typed data in meta
        const tx = JSON.stringify(transfer.tx!);
        const txInfo = JSON.parse(tx);
        const txObj = txInfo.meta;

        console.log("txObj:", txObj);

        const JAM_DOMAIN = txObj.domain;
        const JAM_ORDER_TYPES = txObj.types;
        const toSign = txObj.value;
        const domain = JAM_DOMAIN;

        const types = {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          ...JAM_ORDER_TYPES, // e.g. { JamOrder: [...] }
        };

        console.log("domain:", domain);
        console.log("types:", types);
        console.log("toSign:", toSign);

        const message = toSign; // The actual object being signed
        const msgParams = JSON.stringify({
          domain,
          primaryType: Object.keys(JAM_ORDER_TYPES)[0], // e.g., "JamOrder"
          message,
          types,
        });

        console.log("msgParams:", msgParams);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const account = (window as any).ethereum.selectedAddress;

        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const signature = await (window as any).ethereum.request({
            method: "eth_signTypedData_v4",
            params: [account, msgParams],
          });

          txResponse = signature;
          console.log("EIP-712 Signature:", signature);

          // Poll transaction status with the signature
          pollTransactionStatus(transfer.id.toString(), signature);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (signError: any) {
          console.error("Signing error:", signError);

          // Handle specific JSON-RPC errors
          if (signError.code === -32603) {
            toast({
              variant: "destructive",
              title: "Transaction failed!",
              description:
                "JSON-RPC error occurred. Please try again or switch networks.",
            });
          } else if (signError.code === 4001) {
            toast({
              variant: "destructive",
              title: "Transaction rejected!",
              description: "User rejected the signature request",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Signing failed!",
              description:
                signError.message || "Unknown error occurred during signing",
            });
          }

          setIsLoading(false);
          setTransStatus(null);
          return;
        }
      } else {
        // Fallback to regular transaction if no meta (shouldn't happen for gasless)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const txData: any = {
          data: transfer?.tx.data,
          from: transfer?.tx.from,
          to: transfer?.tx.to,
          value: transfer?.tx.value,
          gasLimit: transfer?.tx.gas,
        };

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
    <div className="flex w-full flex-col gap-y-6 rounded-3xl bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20 backdrop-blur-xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 px-8 py-10 lg:w-auto relative overflow-hidden mx-4 my-6">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10 animate-pulse rounded-3xl"></div>
      <div className="relative z-10">
        <div className="flex w-full flex-col justify-center gap-6 sm:flex-row">
          <div className="flex-2 flex w-full flex-col items-center gap-4 sm:flex-row lg:w-auto">
            <div className="flex w-full">
              <div className="w-full space-y-3 rounded-2xl bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-cyan-400/50 shadow-lg shadow-cyan-400/20 p-6 hover:border-cyan-300/70 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex w-full items-center justify-between">
                      <h4 className="text-xs font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                        💰 SEND
                      </h4>
                      {tokenBalance && (
                        <span className="text-xs text-gray-300">
                          Balance:{" "}
                          {formatBalance(
                            tokenBalance.value.toString(),
                            tokenBalance.decimals,
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        aria-label="deposit"
                        className="m-0 h-auto w-full border-none bg-transparent p-0 text-2xl font-bold text-transparent bg-gradient-to-r from-white to-cyan-200 bg-clip-text placeholder:m-0 placeholder:p-0 placeholder:text-2xl placeholder:text-gray-400 focus:border-none focus:ring-0 focus:outline-none"
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
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-semibold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text uppercase tracking-wider">
                      {transferParams.fromChain}
                    </div>
                    <img
                      src={transferParams.fromTokenIconUrl}
                      className="h-10 w-10 rounded-full ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-400/30"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 p-0.5 shadow-lg shadow-purple-500/30">
              <div className="rounded-full bg-gray-900/90 p-4 backdrop-blur-sm">
                <LiaExchangeAltSolid
                  color="white"
                  className="h-8 w-8 cursor-pointer font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text transition-all duration-300 hover:scale-110 hover:rotate-180 text-white bg-white"
                  onClick={() => switchTransferParams()}
                />
              </div>
            </div>
            <div className="flex w-full">
              <div className="w-full space-y-3 rounded-2xl bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-purple-400/50 shadow-lg shadow-purple-400/20 p-6 hover:border-purple-300/70 transition-all duration-300 lg:w-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={transferParams.toTokenIconUrl}
                      className="h-10 w-10 rounded-full ring-2 ring-purple-400/50 shadow-lg shadow-purple-400/30"
                    />
                    <div className="text-sm font-semibold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text uppercase tracking-wider">
                      {transferParams.toChain}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="w-full text-right text-xs font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
                      💎 RECEIVE
                    </h4>
                    <div className="flex items-center justify-between">
                      <input
                        aria-label="receive"
                        className="m-0 h-auto w-full border-none bg-transparent p-0 text-right text-2xl font-bold text-transparent bg-gradient-to-r from-white to-purple-200 bg-clip-text placeholder:m-0 placeholder:p-0 placeholder:text-2xl placeholder:text-gray-400 focus:border-none focus:ring-0 focus:outline-none"
                        placeholder={"0"}
                        value={
                          convertWeiToEth(
                            transferRoute?.quote?.amount ?? "0",
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
                    className="flex cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 
                                              px-6 py-4 text-sm font-bold text-white shadow-lg shadow-purple-500/30
                                              outline-2 outline-offset-2 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 
                                              active:scale-95"
                  >
                    {transStatus?.status
                      ? "⚡ Track Mission"
                      : "🚀 Initiate Swap"}
                  </PopoverTrigger>
                  <PopoverContent className="min-w-[320px] rounded-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl shadow-purple-500/20">
                    <div className="space-y-2">
                      <div className="text-muted-foreground flex flex-col space-y-4 text-sm">
                        <Label
                          htmlFor="width"
                          className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text font-semibold"
                        >
                          🎯 Target {transferParams.toChain} Address
                        </Label>
                        <Input
                          id="width"
                          defaultValue={walletAddress!}
                          placeholder={walletAddress!}
                          className="col-span-2 h-12 rounded-xl bg-gray-800/50 border border-purple-400/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                          onChange={() => {
                            setTransferParams((prev) => ({
                              ...prev,
                              toUserAddress: walletAddress!,
                            }));
                          }}
                        />
                        {transStatus ? (
                          <div className="flex min-h-[40px] w-full flex-col rounded-xl bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-cyan-400/30 p-4 text-white shadow-lg shadow-cyan-400/10">
                            <h4 className="text-md font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                              🔄 Mission Status
                            </h4>
                            <div className="flex items-center text-cyan-200">
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
                            "flex cursor-pointer items-center rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 font-bold shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 px-6 py-3",
                            {
                              "opacity-60 scale-95": isLoading,
                            },
                          )}
                          disabled={isLoading || !recipientAddress.length}
                          onClick={() => startTransfer()}
                        >
                          🚀 Execute
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
                    "flex cursor-pointer items-center bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-bold shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/40 sm:rounded-2xl px-6 py-4",
                    {
                      "opacity-60 scale-95": isLoading,
                    },
                  )}
                  disabled={isLoading}
                  onClick={() => getQuote()}
                >
                  ⚡ Get Quote
                  {isLoading && (
                    <FontAwesomeIcon
                      className="ml-2"
                      icon={faCircleNotch}
                      spin
                    />
                  )}
                </Button>
              )}
            </>
          ) : (
            <Button
              className={clsx(
                "flex cursor-pointer items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-bold shadow-lg shadow-green-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/40 sm:rounded-2xl px-6 py-4",
                {
                  "opacity-60 scale-95": isLoading,
                },
              )}
              disabled={isLoading}
              onClick={() => connectWallet()}
            >
              🔗 Link Wallet
            </Button>
          )}
        </div>

        {/* Route Selection - Vertical Layout */}
        {availableRoutes.length > 1 && transferRoute && (
          <div className="w-full rounded-xl bg-gradient-to-br from-gray-900/40 via-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-cyan-400/20 shadow-md shadow-cyan-400/5 p-4 mt-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text uppercase tracking-wider">
                  🛣️ ROUTE OPTIONS
                </span>
                <span className="text-xs text-cyan-300">
                  {availableRoutes.length} available
                </span>
              </div>

              <select
                value={selectedRouteIndex}
                onChange={(e) => handleRouteSelection(Number(e.target.value))}
                className="w-full rounded-lg bg-gray-800/60 border border-purple-400/20 text-white px-3 py-3 text-sm focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all duration-300"
              >
                {availableRoutes.map((route, index) => {
                  const bridge =
                    route.route[0]?.bridge || route.quote.integration;
                  const gasUSD = parseFloat(route.gasUSD || "0");
                  const duration = route.duration;

                  return (
                    <option
                      key={index}
                      value={index}
                      className="bg-gray-800 text-white"
                    >
                      {bridge.toUpperCase()} • ${gasUSD.toFixed(4)} gas •{" "}
                      {duration}min
                    </option>
                  );
                })}
              </select>

              <div className="flex justify-between items-center text-xs">
                <div className="text-yellow-300">
                  Gas Cost: $
                  {parseFloat(transferRoute.gasUSD || "0").toFixed(4)}
                </div>
                <div className="text-green-300">
                  Duration: ~{transferRoute.duration}min
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="m-h-[20px] flex min-w-full rounded-2xl bg-gradient-to-br from-gray-900/60 via-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-cyan-400/30 shadow-lg shadow-cyan-400/10 p-6 mt-4">
          <div className="flex w-full flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="w-full rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-700/80 border border-purple-400/20 p-4 hover:border-purple-400/40 transition-all duration-300">
              <label className="block text-xs font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text uppercase tracking-wider">
                🌟 ORIGIN
              </label>
              <div className="font-bold capitalize text-white mt-2 text-sm">
                {transferParams.fromChain} / {transferParams.tokenSymbol}
              </div>
            </div>

            <div className="w-full rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-700/80 border border-cyan-400/20 p-4 hover:border-cyan-400/40 transition-all duration-300">
              <label className="block text-xs font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text uppercase tracking-wider">
                🎯 DESTINATION
              </label>
              <div className="font-bold capitalize text-white mt-2 text-sm">
                {transferParams.toChain} / {transferParams.toTokenSymbol}
              </div>
            </div>

            <div className="w-full rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-700/80 border border-yellow-400/20 p-4 hover:border-yellow-400/40 transition-all duration-300">
              <label className="block text-xs font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text uppercase tracking-wider">
                ⚡ GAS COST
              </label>
              <div className="font-bold capitalize text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text mt-2 text-sm">
                {formatUSD(transferRoute?.gasUSD! ?? 0)}
              </div>
            </div>

            <div className="w-full rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-700/80 border border-green-400/20 p-4 hover:border-green-400/40 transition-all duration-300">
              <label className="block text-xs font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text uppercase tracking-wider">
                💰 VALUE
              </label>
              <div className="font-bold capitalize text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text mt-2 text-lg">
                {formatUSD(transferRoute?.quote?.amountUSD! ?? 0)}
              </div>
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
