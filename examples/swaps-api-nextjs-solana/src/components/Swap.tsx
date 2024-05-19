"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useConnect, metamaskWallet } from "@thirdweb-dev/react";
import {
  useConnectionStatus,
  useAddress,
  useSigner,
} from "@thirdweb-dev/react";
import { Route } from "interfaces/quote.interface";
import {
  getAllowanceRequest,
  getApprovalTxDataRequest,
  getChainsRequest,
  getQuoteRequest,
  getTokensRequest,
  getTransationStatus,
  sendTransactionRequest,
} from "services/requests";
import { convertEthToWei, convertWeiToEth } from "utils/ethToWei";
import { useDebouncedCallback } from "use-debounce";
import { useToast } from "components/ui/use-toast";
import { TransactionStatusAPIResponse } from "interfaces/status.interface";
import { AxiosError } from "axios";
import { Chain } from "interfaces/chain.interface";
import { Token } from "interfaces/token.interface";
import { SelectTokenPanel } from "./ui/SelectTokenPanel";
import { SelectChainPanel } from "./ui/SelectChainPanel";
import { TbSwitchVertical, TbSwitchHorizontal } from "react-icons/tb";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
import { TransactionDetails, pendingStatuses } from "interfaces/send.interface";
import { TransferParams } from "types/transfer.types";
import { TransferHistoryPanel } from "./ui/TransferHistoryPanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const walletConfig = metamaskWallet();

const defaultTransferParams: TransferParams = {
  tokenAmount: "1",
  fromChain: "ethereum",
  tokenSymbol: "ETH",
  fromUserAddress: "",
  fromTokenAddress: "0x0000000000000000000000000000000000000000",
  fromNativeTokenSymbol: "ETH",
  fromTokenIconUrl:
    "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/PNG/eth.png",
  fromChainIconUrl:
    "https://raw.githubusercontent.com/polkaswitch/assets/master/blockchains/ethereum/info/logo.png",
  fromChainDecimal: 18,
  toTokenAddress: "11111111111111111111111111111111",
  toTokenSymbol: "SOL",
  toNativeTokenSymbol: "SOL",
  toChain: "solana",
  toTokenIconUrl:
    "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/SVG/sol.svg",
  toChainIconUrl:
    "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/SVG/sol.svg",
  toUserAddress: "", // solana wallet address
  toChainDecimal: 9,
};

const transactionPollingDuration = 10000;

const Swap = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);

  const [transferParams, setTransferParams] = useState<TransferParams>(
    defaultTransferParams,
  );

  const [solWalletAddress, setSolWalletAddress] = useState<string>("null");

  const [transferRoute, setTransferRoute] = useState<Route | null>(null);
  const [transStatus, setTransStatus] =
    useState<TransactionStatusAPIResponse>();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [solTokens, setSolTokens] = useState<Token[]>([]);
  const [chains, setChains] = useState<Chain[]>([]);

  const connect = useConnect();
  const address = useAddress();

  const connectionStatus = useConnectionStatus();
  const walletAddress = useAddress();
  const signer = useSigner();

  const { toast } = useToast();
  const sendInputRef = useRef<HTMLInputElement>(null);

  const debounced = useDebouncedCallback((value) => {
    setTransferParams((prev: TransferParams) => ({
      ...prev,
      tokenAmount: value,
    }));
    getQuote(value);
  }, 1000);

  useEffect(() => {
    if (window.solana && window.solana.isPhantom) {
      window.solana
        .connect({ onlyIfTrusted: true })
        .then(({ publicKey }) => {
          setSolWalletAddress(publicKey.toString());
          setTransferParams((prev) => ({
            ...prev,
            toUserAddress: publicKey.toString(),
          }));
        })
        .catch((err) =>
          console.error("Failed to connect Phantom wallet:", err),
        );
    }
  }, []);

  useEffect(() => {
    setTransferParams((prev) => {
      return {
        ...prev,
        fromUserAddress: walletAddress!,
      };
    });

    setChains([]);
    setTokens([]);
    setSolTokens([]);

    getChainsRequest({ type: "evm" }).then(setChains);
    getTokensRequest({ chain: defaultTransferParams.fromChain }).then(
      setTokens,
    );
    getTokensRequest({ chain: "solana" }).then(setSolTokens);
  }, [walletAddress]);

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

  const connectToPhantom = async () => {
    try {
      const { solana } = window;
      if (solana && solana.isPhantom) {
        const response = await solana.connect();
        setSolWalletAddress(response.publicKey.toString());
        console.log(
          "Connected to Phantom wallet:",
          response.publicKey.toString(),
        );
      } else {
        alert("Phantom wallet not found. Please install it.");
      }
    } catch (error) {
      console.error("Failed to connect to Phantom wallet:", error);
    }
  };

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
      if (transactionStatus.status === "Completed") {
        toast({
          title: "Transaction Successful",
          description: `Bridge Successful`,
        });
      } else if (transactionStatus.status === "Failed") {
        toast({
          variant: "destructive",
          title: "Transaction Failed",
          description: transStatus?.errorReason,
        });
      }

      setTransferRoute(null);
      setIsTransacting(false);
    }
  }

  async function getQuote(value: string) {

    if (Number(value) <= 0) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Get a quote from the Swing API

      if (transferParams.toUserAddress === "") {
        toast({
          variant: "destructive",
          title: "SOL Address Not Set",
          description: "Please connect your SOL wallet",
        });
        return;
      }

      const quotes = await getQuoteRequest({
        fromChain: transferParams.fromChain,
        fromTokenAddress: transferParams.fromTokenAddress,
        fromUserAddress: transferParams.fromUserAddress,
        toChain: transferParams.toChain,
        tokenSymbol: transferParams.tokenSymbol,
        toTokenAddress: transferParams.toTokenAddress,
        toTokenSymbol: transferParams.toTokenSymbol,
        toUserAddress: transferParams.toUserAddress,
        tokenAmount: convertEthToWei(value, transferParams.fromChainDecimal),
      });

      if (!quotes.routes.length) {
        toast({
          variant: "destructive",
          title: "No routes found",
          description: "No routes available. Try increasing the send amount.",
        });
        setIsLoading(false);
        return;
      }

      setTransferRoute(quotes.routes[0]!);
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

  async function sendSolTrans(
    txData: TransactionDetails,
  ): Promise<string | undefined> {
    const connection = new Connection(
      "https://solana-mainnet.g.alchemy.com/v2/7CHAAo7P4v6NmLwcYuAXQQ6owOiB5q-a",
    );
    const rawTx = Uint8Array.from(Buffer.from(txData.data as any, "hex"));

    let transaction: Transaction | VersionedTransaction;
    try {
      // Attempt to deserialize the transaction as a regular transaction
      transaction = Transaction.from(rawTx);
    } catch (error) {
      // If the transaction is not a regular transaction, attempt to deserialize it as a versioned transaction
      transaction = VersionedTransaction.deserialize(rawTx);
    }

    const response = await window.solana?.signAndSendTransaction(transaction);

    return response?.signature;
  }

  function switchTransferParams() {
    const tempTransferParams: TransferParams = Object.create(transferParams);

    const newTransferParams: TransferParams = {
      tokenAmount: "0",
      fromChain: tempTransferParams.toChain,
      tokenSymbol: tempTransferParams.toTokenSymbol!,
      fromUserAddress: tempTransferParams.toUserAddress!,
      fromTokenAddress: tempTransferParams.toTokenAddress!,
      fromTokenIconUrl: tempTransferParams.toTokenIconUrl,
      fromChainIconUrl: tempTransferParams.toChainIconUrl,
      fromChainDecimal: tempTransferParams.toChainDecimal,
      fromNativeTokenSymbol: tempTransferParams.toNativeTokenSymbol,
      toTokenAddress: tempTransferParams.fromTokenAddress,
      toTokenSymbol: tempTransferParams.tokenSymbol,
      toChain: tempTransferParams.fromChain,
      toChainIconUrl: tempTransferParams.fromChainIconUrl,
      toTokenIconUrl: tempTransferParams.fromTokenIconUrl!,
      toUserAddress: tempTransferParams.fromUserAddress,
      toChainDecimal: tempTransferParams.fromChainDecimal,
      toNativeTokenSymbol: tempTransferParams.fromNativeTokenSymbol,
    };

    setTransferRoute(null);
    setTransferParams(newTransferParams);
    (sendInputRef.current as HTMLInputElement).value = '';
  }

  function onEVMChainSelect(chain: Chain) {

    getTokensRequest({ chain: chain.slug }).then(setTokens);

    if (transferParams.fromChain !== "solana") {
      setTransferParams((prev) => ({
        ...prev,
        tokenAmount: "0",
        fromChain: chain.slug,
        fromChainIconUrl: chain.logo,

        tokenSymbol: tokens[0].symbol,
        fromTokenAddress: tokens[0].address,
        fromTokenIconUrl: tokens[0].logo,
        fromChainDecimal: tokens[0].decimals,
      }));
    } else {
      setTransferParams((prev) => ({
        ...prev,
        tokenAmount: "0",
        toChain: chain.slug,
        toChainIconUrl: chain.logo,

        toTokenSymbol: tokens[0].symbol,
        toTokenAddress: tokens[0].address,
        toTokenIconUrl: tokens[0].logo,
        toChainDecimal: tokens[0].decimals,
      }));
    }

    setTransferRoute(null);
  }

  function onFromTokenSelect(token: Token) {
    setTransferParams((prev) => ({
      ...prev,
      tokenAmount: "0",
      tokenSymbol: token.symbol,
      fromTokenAddress: token.address,
      fromTokenIconUrl: token.logo,
      fromChainDecimal: token.decimals,
    }));
    setTransferRoute(null);
  }

  function onToTokenSelect(token: Token) {
    setTransferParams((prev) => ({
      ...prev,
      tokenAmount: "0",
      toTokenSymbol: token.symbol,
      toTokenAddress: token.address,
      toTokenIconUrl: token.logo,
      toChainDecimal: token.decimals,
    }));
    setTransferRoute(null);
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

    setIsLoading(true);
    setIsTransacting(true);

    const tokenAmount = convertEthToWei(
      transferParams.tokenAmount,
      transferParams.fromChainDecimal,
    );

    try {
      if (transferParams.tokenSymbol !== transferParams.fromNativeTokenSymbol) {
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

        if (checkAllowance.allowance < tokenAmount) {
          setTransStatus({
            status: `Wallet Interaction Required: Approval Token`,
          });

          const getApprovalTxData = await getApprovalTxDataRequest({
            tokenAmount: Number(tokenAmount),
            bridge: transferRoute.quote.integration,
            fromAddress: transferParams.fromUserAddress,
            fromChain: transferParams.fromChain,
            tokenAddress: transferParams.fromTokenAddress,
            tokenSymbol: transferParams.tokenSymbol,
            toChain: transferParams.toChain,
            toTokenAddress: transferParams.toTokenAddress!,
            toTokenSymbol: transferParams.toTokenSymbol!,
            contractCall: true,
          });

          if (transferParams.fromChain !== "solana") {
            const txData: TransactionDetails = {
              data: getApprovalTxData.tx[0].data,
              from: getApprovalTxData.tx[0].from,
              to: getApprovalTxData.tx[0].to,
            };

            const txResponse = await signer?.sendTransaction(txData);

            const receipt = await txResponse?.wait();
            console.log("Transaction receipt:", receipt);

            setTransStatus({ status: "Token allowance approved" });
          }
        }
      }

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

        tokenAmount,
        route: transferRoute.route,
        type: "swap",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txData: any = {
        data: transfer.tx.data,
        from: transfer.tx.from,
        to: transfer.tx.to,
        value: transfer.tx.value,
        txId: transfer.tx.txId,
        gasLimit: transfer.tx.gas,
      };

      setTransStatus({
        status: "Wallet Interaction Required: Approve Transaction",
      });

      let txHash = "";

      if (transferParams.fromChain !== "solana") {
        const txResponse = await signer?.sendTransaction({
          data: txData.data,
          from: txData.from,
          to: txData.to,
          value: txData.value,
          gasLimit: txData.gasLimit,
        });
        // Wait for the transaction to be mined

        const receipt = await txResponse?.wait();
        console.log("Transaction receipt:", receipt);
        txHash = txResponse?.hash!;
      } else {
        const hash = await sendSolTrans({
          ...txData,
          from: transferParams.fromUserAddress,
        });
        txHash = hash!;
      }

      pollTransactionStatus(transfer.id.toString(), txHash);
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

      setIsTransacting(false);
    }

    setIsLoading(false);
  }

  function SelectFromChainPanel() {
    return (
      <div
        className={clsx("bg-zinc-500 rounded-full", {
          "hover:bg-gray-900 bg-zinc-500 cursor-pointer p-2":
            transferParams.fromChain !== "solana",
        })}
      >
        {transferParams.fromChain === "solana" ? (
          <img
            src={transferParams.fromChainIconUrl}
            className="w-7 rounded-full"
          />
        ) : (
          <SelectChainPanel
            onChainSelect={onEVMChainSelect}
            chains={chains!}
            transferParams={
              transferParams.fromChain !== "solana"
                ? {
                    chain: transferParams.fromChain,
                    chainIconUrl: transferParams.fromChainIconUrl!,
                  }
                : {
                    chain: transferParams.toChain,
                    chainIconUrl: transferParams.toChainIconUrl!,
                  }
            }
          />
        )}
      </div>
    );
  }

  function SelectToChainPanel() {
    return (
      <div
        className={clsx("p-2  rounded-xl", {
          "bg-zinc-500 hover:bg-gray-900 cursor-pointer":
            transferParams.toChain !== "solana",
        })}
      >
        {transferParams.toChain === "solana" ? (
          <img
            src={transferParams.toChainIconUrl}
            className="w-7 rounded-full"
          />
        ) : (
          <SelectChainPanel
            onChainSelect={onEVMChainSelect}
            chains={chains!}
            transferParams={
              transferParams.fromChain !== "solana"
                ? {
                    chain: transferParams.fromChain,
                    chainIconUrl: transferParams.fromChainIconUrl!,
                  }
                : {
                    chain: transferParams.toChain,
                    chainIconUrl: transferParams.toChainIconUrl!,
                  }
            }
          />
        )}
      </div>
    );
  }

  function SelectFromTokenPanel() {
    return (
      <div
        className={clsx(
          "p-2 rounded-xl bg-zinc-500 hover:bg-gray-900 cursor-pointer",
        )}
      >
        <SelectTokenPanel
          onTokenSelect={onFromTokenSelect}
          tokens={transferParams.fromChain === "solana" ? solTokens! : tokens}
          transferParams={{
            chain: transferParams.fromChain,
            token: transferParams.tokenSymbol,
            tokenIconUrl: transferParams.fromTokenIconUrl!,
          }}
        />
      </div>
    );
  }

  function SelectToTokenPanel() {
    return (
      <div
        className={clsx(
          "p-2  rounded-xl bg-zinc-500 hover:bg-gray-900 cursor-pointer",
        )}
      >
        <SelectTokenPanel
          onTokenSelect={onToTokenSelect}
          tokens={transferParams.toChain === "solana" ? solTokens! : tokens}
          transferParams={{
            chain: transferParams.toChain,
            token: transferParams.toTokenSymbol,
            tokenIconUrl: transferParams.toTokenIconUrl!,
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col xl:flex-row lg:gap-y-2 gap-y-5 justify-between items-center mb-3">
        <p className="font-bold text-4xl text-gray-200">BRIDGE</p>
        <div className="flex gap-x-2">
          <div className="flex gap-x-2 font-bold text-md text-gray-200">
            {!isTransacting ? (
              <div
                className="justify-center rounded-2xl py-2 px-3 text-sm font-semibold
                                        outline-2 outline-offset-2 transition-colors text-whit
                                        flex items-center bg-zinc-600
                                        active:bg-gray-800 active:text-white/80 gap-x-2"
              >
                <SelectFromChainPanel />
                <SelectFromTokenPanel />
                <div className="p-1 bg-zinc-500 rounded-full hover:bg-gray-900 cursor-pointer">
                  <TbSwitchHorizontal
                    className="size-8 hover:cursor-pointer"
                    onClick={switchTransferParams}
                  />
                </div>

                <SelectToTokenPanel />

                <SelectToChainPanel />
              </div>
            ) : (
              <div
                className="group rounded-2xl py-2 px-3 text-sm font-semibold
                                 outline-2 outline-offset-2 transition-colors text-white hover:bg-gray-900
                                 flex items-center cursor-pointer bg-zinc-600
                                 active:bg-gray-800 active:text-white/80 justify-between gap-x-2"
              >
                <span>{transStatus?.status}</span>
                <span className="w-5 h-5 bg-cyan-400 rounded-full"></span>
              </div>
            )}
          </div>
          <TransferHistoryPanel
            userAddress={transferParams.fromUserAddress}
            className="group rounded-2xl py-2 px-4 text-sm font-semibold hover:cursor-pointer
                                        outline-2 outline-offset-2 transition-colors text-zinc-400
                                        flex items-center bg-zinc-600 
                                        active:bg-gray-800 active:text-zinc-400/80 gap-x-2"
          />
        </div>
      </div>

      <div className="w-full flex flex-col bg-cyan-100 min-h-[20vh] ring-1 ring-cyan-100 space-y-1 rounded-xl  p-3 mb-3">
        <div className="flex flex-col xl:flex-row lg:gap-y-2 gap-y-5 justify-between items-center mb-3">
          <h4 className="text-xl font-bold text-zinc-700">SEND</h4>
          <div className="flex gap-x-2 font-bold text-md text-gray-200">
            {transferParams.fromChain === "solana" && (
              <>
                <button
                  className="group rounded-2xl py-2 px-3 text-sm font-semibold
                                 outline-2 outline-offset-2 transition-colors text-white hover:bg-gray-900
                                 flex items-center cursor-pointer bg-zinc-600
                                 active:bg-gray-800 active:text-white/80 justify-between gap-x-2"
                  onClick={connectToPhantom}
                >
                  <span>
                    {solWalletAddress === ""
                      ? "Connect SOL Wallet"
                      : shortenSolanaAddress(solWalletAddress)}
                  </span>
                  <span className="w-5 h-5 bg-purple-400 rounded-full"></span>
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex grow justify-between items-center">
          <input
            aria-label="deposit"
            className="border-none w-[50%] p-2 h-auto bg-transparent focus:border-none focus:ring-0 placeholder:m-0 placeholder:p-0 placeholder:text-4xl m-0 text-4xl"
            placeholder={"0 " + transferParams.tokenSymbol}
            ref={sendInputRef}
            // disabled={!isConnected}
            onChange={(e) => {
              debounced(e.target.value);
              setTransferRoute(null); // Reset transfer route
            }}
            type="number"
          />
          <div className="flex gap-x-1 items-center rounded-xl hover:cursor-pointer">
            <h4 className="w-full text-4xl font-bold text-zinc-700">
              {transferParams.tokenSymbol}
            </h4>
            <img
              src={transferParams.fromTokenIconUrl}
              className="w-8 rounded-full"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs p-0 m-0 text-zinc-950/[0.6] grow"></p>
        </div>
      </div>

      <div className="relative w-full p-0 m-0 hidden xl:block">
        <div className="w-full flex justify-center absolute -top-10">
          <div
            className="bg-slate-100 p-3 rounded-full ring-4 ring-purple-200 text-slate-300 hover:text-slate-900"
            onClick={switchTransferParams}
          >
            <TbSwitchVertical className="size-10 hover:cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col bg-purple-200 min-h-[20vh] ring-1 ring-purple-200 space-y-2 rounded-xl  p-3 mb-3">
        <div className="flex flex-col xl:flex-row lg:gap-y-2 gap-y-5 justify-between items-center mb-3">
          <h4 className="text-xl font-bold text-zinc-700">RECEIVE</h4>
          <div className="flex gap-x-2 font-bold text-md text-gray-200">
            {transferParams.toChain === "solana" && (
              <button
                className="group rounded-2xl py-2 px-3 text-sm font-semibold
                                 outline-2 outline-offset-2 transition-colors text-white hover:bg-gray-900
                                 flex items-center cursor-pointer bg-zinc-600
                                 active:bg-gray-800 active:text-white/80 justify-between gap-x-2"
                onClick={connectToPhantom}
              >
                <span>
                  {solWalletAddress === ""
                    ? "Connect SOL Wallet"
                    : shortenSolanaAddress(solWalletAddress)}
                </span>
                <span className="w-5 h-5 bg-purple-400 rounded-full"></span>
              </button>
            )}
          </div>
        </div>
        <div className="flex grow justify-between items-center">
          <input
            aria-label="receive"
            disabled
            className="border-none w-[50%] h-auto bg-transparent focus:border-none focus:ring-0 placeholder:m-0 placeholder:p-0 placeholder:text-4xl m-0 text-4xl"
            placeholder={"0 SOL"}
            type="number"
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
          />
          <div className="flex gap-x-1 items-center rounded-xl hover:cursor-pointer">
            <h4 className="w-full text-4xl font-bold text-zinc-700">
              {transferParams.toTokenSymbol}
            </h4>
            <img
              src={transferParams.toTokenIconUrl}
              className="w-8 rounded-full"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-md p-0 m-0 text-zinc-950/[0.6]">
            {formatUSD(transferRoute?.quote?.amountUSD! ?? 0)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 w-full gap-3 min-h-[150px] mb-3">
        <div
          className={clsx(
            "flex flex-col grow bg-pink-300 rounded-xl p-3 transition-all ease-in-out",
            {
              "hover:bg-pink-200 hover:cursor-pointer": !transferRoute,
            },
          )}
        >
          <h4 className={clsx("w-full font-bold text-zinc-700 grow")}>
            BEST ROUTE
          </h4>
          {!transferRoute ? (
            <div className="font-medium text-xl">NO ROUTE FOUND</div>
          ) : (
            <div className="font-medium text-xl">
              {transferRoute.quote.integration.toUpperCase()}
            </div>
          )}
        </div>
        <div
          className={clsx(
            "flex flex-col grow bg-zinc-300 rounded-xl p-3 transition-all ease-in-out",
          )}
        >
          <h4 className={clsx("w-full font-bold text-zinc-700 grow")}>
            GAS FEE
          </h4>
          <div className="font-medium text-xl">
            {formatUSD(transferRoute?.gasUSD! ?? 0)}
          </div>
        </div>
        <div
          className={clsx(
            "flex flex-col grow bg-cyan-200 rounded-xl p-3 transition-all ease-in-out",
          )}
        >
          <h4 className={clsx("w-full font-bold text-zinc-700 grow")}>TOTAL</h4>
          <div className="font-medium text-xl">
            {formatUSD(transferRoute?.quote?.amountUSD! ?? 0)}
          </div>
        </div>
      </div>

      <div className="flex justify-between w-full gap-3 min-h-[150px]">
        <button
          disabled={
            isLoading ||
            isTransacting ||
            (connectionStatus === "connected" && !transferRoute) ||
            (connectionStatus !== "connected" &&
              transferParams.toUserAddress === "")
          }
          className={clsx(
            "flex flex-col justify-center grow rounded-xl p-3 bg-zinc-300 transition-all ease-in-out hover:cursor-pointer",
            {
              "hover:bg-blue-200":
                connectionStatus === "connected" && transferRoute,
              "opacity-30":
                (isLoading || !transferRoute || isTransacting) &&
                connectionStatus === "connected",
            },
          )}
          onClick={() =>
            connectionStatus === "connected" ? startTransfer() : connectWallet()
          }
        >
          <h4 className="w-full font-bold text-zinc-700">
            <>
              {connectionStatus === "connected"
                ? isLoading && !transferRoute
                  ? "FETCHING QUOTE"
                  : "START TRANSFER"
                : "CONNECT WALLET"}
              {(isLoading || isTransacting) && (
                <FontAwesomeIcon className="ml-2" icon={faCircleNotch} spin />
              )}
            </>
          </h4>
        </button>
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

function shortenSolanaAddress(address: string) {
  return address.slice(0, 4) + "..." + address.slice(-4);
}

export default Swap;
