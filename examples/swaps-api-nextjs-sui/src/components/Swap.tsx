"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useConnect, metamaskWallet } from "@thirdweb-dev/react";
import {
  useConnectionStatus,
  useAddress,
  useSigner,
} from "@thirdweb-dev/react";
import { SwingServiceAPI } from "services/requests";
import { convertEthToWei, convertWeiToEth } from "utils/ethToWei";
import { useDebouncedCallback } from "use-debounce";
import { useToast } from "components/ui/use-toast";
import { TransactionStatusAPIResponse } from "interfaces/status.interface";
import { Chain } from "interfaces/chain.interface";
import { Token } from "interfaces/token.interface";
import { SelectTokenPanel } from "./ui/SelectTokenPanel";
import { SelectChainPanel } from "./ui/SelectChainPanel";
import { TbSwitchVertical, TbSwitchHorizontal } from "react-icons/tb";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

import { useWallet, ConnectButton } from "@suiet/wallet-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { TransferParams } from "types/transfer.types";
import { TransferHistoryPanel } from "./ui/TransferHistoryPanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ISwingServiceAPI } from "interfaces/swing-service.interface";
import { Route } from "interfaces/quote.interface";
import { TransactionData } from "interfaces/approval.interface";

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
  toTokenAddress: "0x2::sui::SUI",
  toTokenSymbol: "SUI",
  toNativeTokenSymbol: "SUI",
  toChain: "sui",
  toTokenIconUrl:
    "https://s3.ap-northeast-1.amazonaws.com/platform.swing.xyz/assets/sui/0beaf5f2701b3d57daadb0f83f8dae77c23658aeca1d5958402657122b0fa02f.png",
  toChainIconUrl:
    "https://s3.ap-northeast-1.amazonaws.com/platform.swing.xyz/assets/sui/0beaf5f2701b3d57daadb0f83f8dae77c23658aeca1d5958402657122b0fa02f.png",
  toUserAddress:
    "0x308e0f34cd38d6e28912367abe9d044664396aa2569b274198bbb09a8302c030", // sui wallet address
  toChainDecimal: 9,
};

const transactionPollingDuration = 10000;

const Swap = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);

  const [transferParams, setTransferParams] = useState<TransferParams>(
    defaultTransferParams,
  );

  const [transferRoute, setTransferRoute] = useState<Route | null>(null);
  const [transStatus, setTransStatus] =
    useState<TransactionStatusAPIResponse | null>();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [suiTokens, setSuiTokens] = useState<Token[]>([]);
  const [chains, setChains] = useState<Chain[]>([]);
  const [swingServiceAPI, setSwingServiceAPI] = useState<
    ISwingServiceAPI | undefined
  >();

  const connect = useConnect();
  const address = useAddress();
  const wallet = useWallet();

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

  //Initialize Swing Service API from service.ts file
  useEffect(() => {
    setSwingServiceAPI(new SwingServiceAPI());
  }, []);

  //Fetch chains and tokens whenever wallet address changes
  useEffect(() => {
    setTransferParams((prev) => {
      return {
        ...prev,
        fromUserAddress: walletAddress!,
      };
    });

    setChains([]);
    setTokens([]);
    setSuiTokens([]);

    swingServiceAPI
      ?.getChainsRequest({ type: "evm" })
      .then((chains: Chain[] | undefined) => {
        setChains(chains!);
      });

    swingServiceAPI
      ?.getTokensRequest({ chain: defaultTransferParams.fromChain })
      .then((tokens: Token[] | undefined) => {
        setTokens(tokens!);
      });

    swingServiceAPI
      ?.getTokensRequest({ chain: "sui" })
      .then((tokens: Token[] | undefined) => {
        setSuiTokens(tokens!);
      });
  }, [walletAddress]);

  // Keep SUI addresses in sync with connected SUI wallet
  useEffect(() => {
    if (!wallet?.address) return;
    setTransferParams((prev) => ({
      ...prev,
      ...(prev.fromChain === "sui" ? { fromUserAddress: wallet.address! } : {}),
      ...(prev.toChain === "sui" ? { toUserAddress: wallet.address! } : {}),
    }));
  }, [wallet?.address]);

  //Connect to Ethereum Wallet
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
    const transactionStatus = await swingServiceAPI?.getTransationStatusRequest(
      {
        id: transId,
        txHash,
      },
    );

    setTransStatus(transactionStatus);

    return transactionStatus;
  }

  async function pollTransactionStatus(transId: string, txHash: string) {
    const transactionStatus = await getTransStatus(transId, txHash);

    if (transactionStatus?.status! === "Pending") {
      setTimeout(
        () => pollTransactionStatus(transId, txHash),
        transactionPollingDuration,
      );
    } else {
      if (transactionStatus?.status === "Success") {
        toast({
          title: "Transaction Successful",
          description: `Bridge Successful`,
        });
      } else if (transactionStatus?.status === "Failed") {
        toast({
          variant: "destructive",
          title: "Transaction Failed",
          description: transStatus?.errorReason,
        });
      }

      setTransferRoute(null);
      setTransStatus(null);
      setIsTransacting(false);
      setIsLoading(false);
      (sendInputRef.current as HTMLInputElement).value = "";
    }
  }

  async function getQuote(value: string) {
    if (Number(value) <= 0) {
      return;
    }

    setIsLoading(true);

    try {
      if (transferParams.toUserAddress === "") {
        toast({
          variant: "destructive",
          title: "SUI Address Not Set",
          description: "Please connect your SUI wallet",
        });
        return;
      }

      const quotes = await swingServiceAPI?.getQuoteRequest({
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

      if (!quotes?.routes?.length) {
        toast({
          variant: "destructive",
          title: "No routes found",
          description: "No routes available. Try increasing the send amount.",
        });
        setIsLoading(false);
        return;
      }

      setTransferRoute(quotes.routes.at(0)!);
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

  // Convert a hex string to Uint8Array (supports both upper/lower case, no 0x prefix expected)
  function hexToBytes(hex: string): Uint8Array {
    const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
    if (clean.length % 2 !== 0) throw new Error("Invalid hex length");
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
      bytes[i / 2] = parseInt(clean.substr(i, 2), 16);
    }
    return bytes;
  }

  // Convert a base64 string to Uint8Array
  function base64ToBytes(b64: string): Uint8Array {
    if (typeof atob === "function") {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    }
    // Fallback for environments without atob (shouldn't happen in client)
    return Uint8Array.from(Buffer.from(b64, "base64"));
  }

  async function sendSuiTrans(
    txData: TransactionData,
  ): Promise<string | undefined> {
    const raw = txData.data!;

    // The backend may return base64 or hex. Normalize to bytes and build a TransactionBlock.
    const isHex = /^[0-9a-fA-F]+$/.test(raw.replace(/^0x/, ""));
    const bytes = isHex ? hexToBytes(raw) : base64ToBytes(raw);
    const txb = TransactionBlock.from(bytes);

    const signedTx = await wallet.signAndExecuteTransactionBlock({
      transactionBlock: txb,
    });

    return signedTx.digest;
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

    (sendInputRef.current as HTMLInputElement).value = "";
  }

  function onEVMChainSelect(chain: Chain) {
    swingServiceAPI
      ?.getTokensRequest({ chain: chain.slug })
      .then((tokens: Token[] | undefined) => {
        setTokens(tokens!);
      });

    if (transferParams.fromChain !== "sui") {
      setTransferParams((prev) => ({
        ...prev,
        tokenAmount: "0",
        fromChain: chain.slug,
        fromChainIconUrl: chain.logo,

        tokenSymbol: tokens[0].symbol,
        fromTokenAddress: tokens[0].address,
        fromTokenIconUrl: tokens[0].logo,
        fromChainDecimal: tokens[0].decimals,
        fromNativeTokenSymbol: chain.nativeToken?.symbol,
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
        toNativeTokenSymbol: chain.nativeToken?.symbol,
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
      if (
        transferParams.tokenSymbol !== transferParams.fromNativeTokenSymbol &&
        transferParams.fromChain !== "sui"
      ) {
        const checkAllowance = await swingServiceAPI?.getAllowanceRequest({
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

        if (checkAllowance?.allowance! != tokenAmount) {
          setTransStatus({
            status: `Wallet Interaction Required: Approval Token`,
          });

          const getApprovalTxData =
            await swingServiceAPI?.getApprovalTxDataRequest({
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

          const txData: TransactionData = {
            data: getApprovalTxData?.tx?.at(0)?.data!,
            from: getApprovalTxData?.tx?.at(0)?.from!,
            to: getApprovalTxData?.tx?.at(0)?.to!,
          };

          const txResponse = await signer?.sendTransaction(txData);

          const receipt = await txResponse?.wait();
          console.log("Transaction receipt:", receipt);

          setTransStatus({ status: "Token allowance approved" });
        }
      }

      console.log({
        fromChain: transferParams.fromChain,
        fromTokenAddress: transferParams.fromTokenAddress,
        fromUserAddress: transferParams.fromUserAddress,
        tokenSymbol: transferParams.tokenSymbol,

        toTokenAddress: transferParams.toTokenAddress!,
        toChain: transferParams.toChain,
        toTokenAmount: transferRoute.quote.amount,
        toTokenSymbol: transferParams.toTokenSymbol!,
        toUserAddress: transferParams.toUserAddress!,
        integration: transferRoute.quote.integration,

        tokenAmount,
        route: transferRoute.route,
        type: "swap",
      });

      const transfer = await swingServiceAPI?.sendTransactionRequest({
        fromChain: transferParams.fromChain,
        fromTokenAddress: transferParams.fromTokenAddress,
        fromUserAddress: transferParams.fromUserAddress,
        tokenSymbol: transferParams.tokenSymbol,

        toTokenAddress: transferParams.toTokenAddress!,
        toChain: transferParams.toChain,
        toTokenAmount: transferRoute.quote.amount,
        toTokenSymbol: transferParams.toTokenSymbol!,
        toUserAddress: transferParams.toUserAddress!,
        integration: transferRoute.quote.integration,

        tokenAmount,
        route: transferRoute.route,
        type: "swap",
      });

      if (!transfer) {
        toast({
          variant: "destructive",
          title: "Something went wrong!",
          description: "Transaction Failed",
        });
        setIsLoading(false);
        setIsTransacting(false);
        setTransStatus(null);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const txData: any = {
        data: transfer?.tx?.data,
        from: transfer?.tx?.from!,
        to: transfer?.tx?.to!,
        value: transfer?.tx?.value!,
        txId: transfer?.tx?.txId!,
        gasLimit: transfer?.tx?.gas!,
      };

      setTransStatus({
        status: "Wallet Interaction Required: Approve Transaction",
      });

      let txHash = "";

      if (transferParams.fromChain === "sui") {
        const hash = await sendSuiTrans({
          ...txData,
          from: transferParams.fromUserAddress,
        });
        txHash = hash!;
      } else {
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
      }

      pollTransactionStatus(transfer?.id.toString()!, txHash);
    } catch (error) {
      console.error("Transfer Error:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong!",
        description: "Something went wrong",
      });

      setIsTransacting(false);
      setTransStatus(null);
    }
  }

  function SelectFromChainPanel() {
    return (
      <div
        className={clsx("rounded-full bg-zinc-500", {
          "cursor-pointer bg-zinc-500 p-2 hover:bg-gray-900":
            transferParams.fromChain !== "sui",
        })}
      >
        {transferParams.fromChain === "sui" ? (
          <img
            src={transferParams.fromChainIconUrl}
            className="w-7 rounded-full"
          />
        ) : (
          <SelectChainPanel
            onChainSelect={onEVMChainSelect}
            chains={chains!}
            transferParams={
              transferParams.fromChain !== "sui"
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
        className={clsx("rounded-xl  p-2", {
          "cursor-pointer bg-zinc-500 hover:bg-gray-900":
            transferParams.toChain !== "sui",
        })}
      >
        {transferParams.toChain === "sui" ? (
          <img
            src={transferParams.toChainIconUrl}
            className="w-7 rounded-full"
          />
        ) : (
          <SelectChainPanel
            onChainSelect={onEVMChainSelect}
            chains={chains!}
            transferParams={
              transferParams.fromChain !== "sui"
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
          "cursor-pointer rounded-xl bg-zinc-500 p-2 hover:bg-gray-900",
        )}
      >
        <SelectTokenPanel
          onTokenSelect={onFromTokenSelect}
          tokens={transferParams.fromChain === "sui" ? suiTokens! : tokens}
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
          "cursor-pointer  rounded-xl bg-zinc-500 p-2 hover:bg-gray-900",
        )}
      >
        <SelectTokenPanel
          onTokenSelect={onToTokenSelect}
          tokens={transferParams.toChain === "sui" ? suiTokens! : tokens}
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
      <div className="mb-3 flex flex-col items-center justify-between gap-y-5 lg:gap-y-2 xl:flex-row">
        <p className="text-4xl font-bold text-gray-200">BRIDGE</p>
        <div className="flex gap-x-2">
          <div className="text-md flex gap-x-2 font-bold text-gray-200">
            {!isTransacting ? (
              <div
                className="text-whit flex items-center justify-center gap-x-2 rounded-2xl
                                        bg-zinc-600 px-3 py-2 text-sm
                                        font-semibold outline-2 outline-offset-2 transition-colors"
              >
                <SelectFromChainPanel />
                <SelectFromTokenPanel />
                <div
                  className="group rounded-full bg-zinc-500 p-1 hover:bg-gray-900"
                  onClick={switchTransferParams}
                >
                  <TbSwitchHorizontal className="size-8 group-hover:cursor-pointer" />
                </div>

                <SelectToTokenPanel />

                <SelectToChainPanel />
              </div>
            ) : (
              <div
                className="group flex cursor-pointer items-center justify-between gap-x-2
                                 rounded-2xl bg-zinc-600 px-3 py-2 text-sm
                                 font-semibold text-white outline-2 outline-offset-2
                                 transition-colors hover:bg-gray-900 active:bg-gray-800 active:text-white/80"
              >
                <span>{transStatus?.status}</span>
                <span className="h-5 w-5 rounded-full bg-cyan-400"></span>
              </div>
            )}
          </div>
          <TransferHistoryPanel
            userAddress={transferParams.fromUserAddress}
            swingServiceAPI={swingServiceAPI!}
            className="group flex items-center gap-x-2 rounded-2xl bg-zinc-600 px-4
                                        py-2 text-sm font-semibold text-zinc-400
                                        outline-2 outline-offset-2 transition-colors 
                                        hover:cursor-pointer active:bg-gray-800 active:text-zinc-400/80"
          />
        </div>
      </div>

      <div className="mb-3 flex min-h-[20vh] w-full flex-col space-y-1 rounded-xl bg-cyan-100 p-3  ring-1 ring-cyan-100">
        <div className="mb-3 flex flex-col items-center justify-between gap-y-5 lg:gap-y-2 xl:flex-row">
          <h4 className="text-xl font-bold text-zinc-700">SEND</h4>
          <div className="text-md flex gap-x-2 font-bold text-gray-200">
            {transferParams.fromChain === "sui" && (
              <>
                <ConnectButton
                  label="Connect SUI Wallet"
                  className="group flex cursor-pointer items-center justify-between gap-x-2
                                 rounded-2xl bg-zinc-600 px-3 py-2 text-sm
                                 font-semibold text-white outline-2 outline-offset-2
                                 transition-colors hover:bg-gray-900 active:bg-gray-800 active:text-white/80"
                />
              </>
            )}
          </div>
        </div>
        <div className="flex grow items-center justify-between">
          <input
            aria-label="deposit"
            className="m-0 h-auto w-[50%] border-none bg-transparent p-2 text-4xl placeholder:m-0 placeholder:p-0 placeholder:text-4xl focus:border-none focus:ring-0"
            placeholder={"0 " + transferParams.tokenSymbol}
            ref={sendInputRef}
            disabled={transferParams.fromChain === "sui" && !wallet.address}
            onChange={(e) => {
              debounced(e.target.value);
              setTransferRoute(null); // Reset transfer route
            }}
            type="number"
          />
          <div className="flex items-center gap-x-1 rounded-xl hover:cursor-pointer">
            <h4 className="w-full text-4xl font-bold text-zinc-700">
              {transferParams.tokenSymbol}
            </h4>
            <img
              src={transferParams.fromTokenIconUrl}
              className="w-8 rounded-full"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="m-0 grow p-0 text-xs text-zinc-950/[0.6]"></p>
        </div>
      </div>

      <div className="relative m-0 hidden w-full p-0 xl:block">
        <div className="absolute -top-10 flex w-full justify-center">
          <div
            className="rounded-full bg-slate-100 p-3 text-slate-300 ring-4 ring-blue-200 hover:text-slate-900"
            onClick={switchTransferParams}
          >
            <TbSwitchVertical className="size-10 hover:cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="mb-3 flex min-h-[20vh] w-full flex-col space-y-2 rounded-xl bg-blue-200 p-3  ring-1 ring-blue-200">
        <div className="mb-3 flex flex-col items-center justify-between gap-y-5 lg:gap-y-2 xl:flex-row">
          <h4 className="text-xl font-bold text-zinc-700">RECEIVE</h4>
          <div className="text-md flex gap-x-2 font-bold text-gray-200">
            {transferParams.toChain === "sui" && (
              <ConnectButton
                label="Connect SUI Wallet"
                className="group flex cursor-pointer items-center justify-between gap-x-2
                                 rounded-2xl bg-zinc-600 px-3 py-2 text-sm
                                 font-semibold text-white outline-2 outline-offset-2
                                 transition-colors hover:bg-gray-900 active:bg-gray-800 active:text-white/80"
              />
            )}
          </div>
        </div>
        <div className="flex grow items-center justify-between">
          <input
            aria-label="receive"
            disabled
            className="m-0 h-auto w-[50%] border-none bg-transparent text-4xl placeholder:m-0 placeholder:p-0 placeholder:text-4xl focus:border-none focus:ring-0"
            placeholder={"0 SUI"}
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
          <div className="flex items-center gap-x-1 rounded-xl hover:cursor-pointer">
            <h4 className="w-full text-4xl font-bold text-zinc-700">
              {transferParams.toTokenSymbol}
            </h4>
            <img
              src={transferParams.toTokenIconUrl}
              className="w-8 rounded-full"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-md m-0 p-0 text-zinc-950/[0.6]">
            {formatUSD(transferRoute?.quote?.amountUSD! ?? 0)}
          </p>
        </div>
      </div>

      <div className="mb-3 grid min-h-[150px] w-full gap-3 lg:grid-cols-3">
        <div
          className={clsx(
            "flex grow flex-col rounded-xl bg-blue-300 p-3 transition-all ease-in-out",
            {
              "hover:cursor-pointer hover:bg-blue-200": !transferRoute,
            },
          )}
        >
          <h4 className={clsx("w-full grow font-bold text-zinc-700")}>
            BEST ROUTE
          </h4>
          {!transferRoute ? (
            <div className="text-xl font-medium">NO ROUTE FOUND</div>
          ) : (
            <div className="text-xl font-medium">
              {transferRoute.quote.integration.toUpperCase()}
            </div>
          )}
        </div>
        <div
          className={clsx(
            "flex grow flex-col rounded-xl bg-zinc-300 p-3 transition-all ease-in-out",
          )}
        >
          <h4 className={clsx("w-full grow font-bold text-zinc-700")}>
            GAS FEE
          </h4>
          <div className="text-xl font-medium">
            {formatUSD(transferRoute?.gasUSD! ?? 0)}
          </div>
        </div>
        <div
          className={clsx(
            "flex grow flex-col rounded-xl bg-cyan-200 p-3 transition-all ease-in-out",
          )}
        >
          <h4 className={clsx("w-full grow font-bold text-zinc-700")}>TOTAL</h4>
          <div className="text-xl font-medium">
            {formatUSD(transferRoute?.quote?.amountUSD! ?? 0)}
          </div>
        </div>
      </div>

      <div className="flex min-h-[150px] w-full justify-between gap-3">
        <button
          disabled={
            isLoading ||
            isTransacting ||
            !transferRoute ||
            (transferParams.fromChain !== "sui" &&
              connectionStatus !== "connected")
          }
          className={clsx(
            "flex grow flex-col justify-center rounded-xl bg-zinc-300 p-3 transition-all ease-in-out hover:cursor-pointer",
            {
              "hover:bg-blue-200":
                !!transferRoute &&
                (transferParams.fromChain === "sui" ||
                  connectionStatus === "connected"),
              "opacity-30":
                isLoading ||
                !transferRoute ||
                isTransacting ||
                (transferParams.fromChain !== "sui" &&
                  connectionStatus !== "connected"),
            },
          )}
          onClick={() => {
            if (transferParams.fromChain === "sui") return startTransfer();
            if (connectionStatus === "connected") return startTransfer();
            return connectWallet();
          }}
        >
          <h4 className="w-full font-bold text-zinc-700">
            <>
              {transferParams.fromChain === "sui"
                ? isLoading && !transferRoute
                  ? "FETCHING QUOTE"
                  : "START TRANSFER"
                : connectionStatus === "connected"
                  ? isLoading && !transferRoute
                    ? "FETCHING QUOTE"
                    : "START TRANSFER"
                  : "CONNECT ETHEREUM WALLET"}
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

export default Swap;
