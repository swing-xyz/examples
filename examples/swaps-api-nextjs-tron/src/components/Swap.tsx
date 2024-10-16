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
import { AxiosError } from "axios";
import { Chain } from "interfaces/chain.interface";
import { Token } from "interfaces/token.interface";
import { SelectTokenPanel } from "./ui/SelectTokenPanel";
import { SelectChainPanel } from "./ui/SelectChainPanel";
import { TbSwitchHorizontal } from "react-icons/tb";
import { faCircleNotch, faHistory } from "@fortawesome/free-solid-svg-icons";
import { TransferParams } from "types/transfer.types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ISwingServiceAPI } from "interfaces/swing-service.interface";
import { Route } from "interfaces/quote.interface";
import { TransactionData } from "interfaces/approval.interface";

import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { TronLinkAdapterName } from "@tronweb3/tronwallet-adapters";

const walletConfig = metamaskWallet();

const defaultTransferParams: TransferParams = {
  tokenAmount: "1",
  fromChain: "ethereum",
  tokenSymbol: "ETH",
  fromUserAddress: "",
  dummyFromUserAddress: "0x018c15DA1239B84b08283799B89045CD476BBbBb",
  dummyToUserAddress: "TV6ybRmqiUK6a7JVMRwPg2cDDkLqgR5MaZ",
  fromTokenAddress: "0x0000000000000000000000000000000000000000",
  fromNativeTokenSymbol: "ETH",
  fromTokenIconUrl:
    "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/PNG/eth.png",
  fromChainIconUrl:
    "https://raw.githubusercontent.com/polkaswitch/assets/master/blockchains/ethereum/info/logo.png",
  fromChainDecimal: 18,
  toTokenAddress: "0x0000000000000000000000000000000000000000",
  toTokenSymbol: "TRX",
  toNativeTokenSymbol: "TRX",
  toChain: "tron",
  toTokenIconUrl:
    "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/SVG/trx.svg",
  toChainIconUrl:
    "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/SVG/trx.svg",
  toUserAddress: "", // tron wallet address
  toChainDecimal: 6,
};

const transactionPollingDuration = 10000;

const Swap = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);

  const [transferParams, setTransferParams] = useState<TransferParams>(
    defaultTransferParams,
  );

  const [tronWalletAddress, setTronWalletAddress] = useState<string>("");

  const [transferRoute, setTransferRoute] = useState<Route | null>(null);
  const [transStatus, setTransStatus] =
    useState<TransactionStatusAPIResponse | null>();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [tronTokens, setTronTokens] = useState<Token[]>([]);
  const [chains, setChains] = useState<Chain[]>([]);
  const [quotes, setQuotes] = useState<Route[]>();
  const [swingServiceAPI, setSwingServiceAPI] = useState<
    ISwingServiceAPI | undefined
  >();

  const connect = useConnect();
  const address = useAddress();

  const connectionStatus = useConnectionStatus();
  const walletAddress = useAddress();
  const signer = useSigner();

  const { toast } = useToast();
  const sendInputRef = useRef<HTMLInputElement>(null);

  const {
    wallet,
    connected: tronConnected,
    address: tronAddress,
    select,
    disconnect,
  } = useWallet();

  const debounced = useDebouncedCallback((value) => {
    setTransferParams((prev: TransferParams) => ({
      ...prev,
      tokenAmount: value,
    }));
    getQuote(value);
  }, 1000);

  //Initialize Swing Service API from service.ts file and connect to tron wallet if installed
  // Replace the TronLink connection logic in useEffect
  useEffect(() => {
    setSwingServiceAPI(new SwingServiceAPI());
    if (tronConnected && tronAddress) {
      setTronWalletAddress(tronAddress);
      setTransferParams((prev) => ({
        ...prev,
        toUserAddress: tronAddress,
      }));
    }
  }, [tronConnected, tronAddress]);

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
    setTronTokens([]);

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
      ?.getTokensRequest({ chain: "tron" })
      .then((tokens: Token[] | undefined) => {
        setTronTokens(tokens!);
      });
  }, [walletAddress]);

  const selectRef = useRef<HTMLSelectElement>(null);

  // Function to change the selected item
  const changeSelectedItem = (index: string) => {
    if (selectRef.current) {
      selectRef.current.value = index;
      // Trigger the onChange event manually
      const event = new Event("change", { bubbles: true });
      selectRef.current.dispatchEvent(event);
    }
  };

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
          title: "TRX Address Not Set",
          description: "Please connect your TRX wallet",
        });
        return;
      }

      const quotes = await swingServiceAPI?.getQuoteRequest({
        fromChain: transferParams.fromChain,
        fromTokenAddress: transferParams.fromTokenAddress,
        fromUserAddress:
          transferParams.fromUserAddress ??
          defaultTransferParams.dummyFromUserAddress,
        toChain: transferParams.toChain,
        tokenSymbol: transferParams.tokenSymbol,
        toTokenAddress: transferParams.toTokenAddress,
        toTokenSymbol: transferParams.toTokenSymbol,
        toUserAddress:
          transferParams.toUserAddress ??
          defaultTransferParams.dummyToUserAddress,
        tokenAmount: convertEthToWei(value, transferParams.fromChainDecimal),
      });

      if (!quotes?.routes?.length) {
        toast({
          variant: "destructive",
          title: "No routes found",
          description: "No routes available. Try increasing the send amount.",
        });
        setIsLoading(false);
        changeSelectedItem("NON");
        return;
      }

      setQuotes(quotes.routes);
      setTransferRoute(quotes.routes[0]);
      setTimeout(
        () => changeSelectedItem(quotes.routes[0].quote.integration),
        500,
      );
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

  // Update the sendTronTrans function
  async function sendTronTrans(
    txData: TransactionData,
  ): Promise<string | undefined> {
    try {
      if (!tronConnected || !wallet) {
        throw new Error("Tron wallet is not connected");
      }

      // Create and sign the transaction
      const signedTx = await wallet.adapter.signTransaction(txData.meta!);

      // Broadcasting the transaction
      const broadcast =
        await window?.tronLink?.tronWeb.trx.sendRawTransaction(signedTx);
      console.log(`broadcast: ${broadcast?.result}`, signedTx.txID);

      return signedTx.txID as string;
    } catch (error) {
      console.error("Error sending Tron transaction:", error);
      throw new Error((error as Error).message);
    }
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
    setQuotes([]);
    changeSelectedItem("NON"),
      ((sendInputRef.current as HTMLInputElement).value = "");
  }

  function onEVMChainSelect(chain: Chain) {
    swingServiceAPI
      ?.getTokensRequest({ chain: chain.slug })
      .then((tokens: Token[] | undefined) => {
        setTokens(tokens!);
      });

    if (transferParams.fromChain !== "tron") {
      setTransferParams((prev) => ({
        ...prev,
        tokenAmount: "0",
        fromChain: chain.slug,
        fromChainIconUrl: chain.logo,

        tokenSymbol: chain.nativeToken?.symbol!,
        fromTokenAddress: chain.nativeToken?.address!,
        fromTokenIconUrl: chain.nativeToken?.logo,
        fromChainDecimal: chain.nativeToken?.decimals,
        fromNativeTokenSymbol: chain.nativeToken?.symbol,
      }));
    } else {
      setTransferParams((prev) => ({
        ...prev,
        tokenAmount: "0",
        toChain: chain.slug,
        toChainIconUrl: chain.logo,

        toTokenSymbol: chain.nativeToken?.symbol!,
        toTokenAddress: chain.nativeToken?.address!,
        toTokenIconUrl: chain.nativeToken?.logo!,
        toChainDecimal: chain.nativeToken?.decimals!,
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
        transferParams.fromChain !== "tron"
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
        meta: transfer?.tx?.meta,
      };

      setTransStatus({
        status: "Wallet Interaction Required: Approve Transaction",
      });

      let txHash = "";

      if (transferParams.fromChain === "tron") {
        const txId = await sendTronTrans(txData);
        txHash = txId!;
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
        description:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          `${(error as AxiosError & any)?.response?.data?.error} : ${(error as AxiosError & any)?.response?.data?.message}` ??
          (error as Error).message ??
          "Something went wrong",
      });

      setIsTransacting(false);
      setTransStatus(null);
    }
  }

  function SelectFromChainPanel() {
    return (
      <div
        className={clsx("flex grow transform justify-center", {
          "cursor-pointer p-2 hover:bg-gray-900":
            transferParams.fromChain !== "tron",
        })}
      >
        {transferParams.fromChain === "tron" ? (
          <img src={transferParams.fromChainIconUrl} className="w-7" />
        ) : (
          <SelectChainPanel
            onChainSelect={onEVMChainSelect}
            chains={chains!}
            transferParams={
              transferParams.fromChain !== "tron"
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
        className={clsx("grow transform p-2", {
          "cursor-pointer hover:bg-pink-900": transferParams.toChain !== "tron",
        })}
      >
        {transferParams.toChain === "tron" ? (
          <img src={transferParams.toChainIconUrl} className="w-7" />
        ) : (
          <SelectChainPanel
            onChainSelect={onEVMChainSelect}
            chains={chains!}
            transferParams={
              transferParams.fromChain !== "tron"
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
          "relative z-10 h-12 grow -skew-x-2 transform cursor-pointer bg-purple-500 p-2 hover:bg-gray-900",
        )}
      >
        <SelectTokenPanel
          onTokenSelect={onFromTokenSelect}
          tokens={transferParams.fromChain === "tron" ? tronTokens! : tokens}
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
          "relative z-10 h-12 grow -skew-x-2 transform cursor-pointer bg-yellow-500 p-2 text-black hover:bg-gray-900",
        )}
      >
        <SelectTokenPanel
          onTokenSelect={onToTokenSelect}
          tokens={transferParams.toChain === "tron" ? tronTokens! : tokens}
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
    <div className="flex flex-row justify-center">
      <div className="w-96 rounded-xl bg-white shadow-md lg:max-w-96">
        <div className="mb-6 flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">Tron Gate</h1>

          <div className="flex items-center">
            <button
              className="flex items-center gap-1 rounded-xl bg-purple-300 p-2 text-xs font-bold ring-1 ring-purple-600"
              onClick={() =>
                tronConnected ? disconnect() : select(TronLinkAdapterName)
              }
            >
              <span
                className={clsx("p4 h-4 w-4 rounded-full", {
                  "bg-red-500": !tronConnected,
                  "bg-green-500": tronConnected,
                })}
              ></span>
              <span>
                {tronConnected ? <>Tron Connected</> : <>Connect Tron</>}
              </span>
            </button>
            <div className="h-5 w-5 cursor-pointer rounded-full">
              <FontAwesomeIcon className="ml-2" icon={faHistory} />
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="text-md flex justify-center gap-x-2 font-bold text-gray-200">
            {!isTransacting ? (
              <div className="flex w-full   justify-between  bg-purple-200">
                <div
                  className="flex items-center gap-x-2 px-3 text-sm
                                        font-semibold text-white outline-2 outline-offset-2
                                        transition-colors"
                >
                  <p className="text-black">SRC</p>
                  <SelectFromChainPanel />
                  <SelectFromTokenPanel />
                </div>
                <div
                  className="group relative z-10 flex -skew-x-2 transform items-center bg-zinc-500
                                        p-1 px-3 text-sm font-semibold
                                        text-white outline-2 outline-offset-2 transition-colors hover:bg-gray-900"
                  onClick={() => {
                    switchTransferParams();
                  }}
                >
                  <TbSwitchHorizontal className="size-8 group-hover:cursor-pointer" />
                </div>

                <div
                  className="flex items-center gap-x-2 px-3 text-sm
                                        font-semibold text-white outline-2 outline-offset-2
                                        transition-colors"
                >
                  <SelectToTokenPanel />
                  <SelectToChainPanel />
                  <p className="text-black">DEST</p>
                </div>
              </div>
            ) : (
              <div
                className="group flex w-full cursor-pointer items-center justify-between
                                 gap-x-2 bg-zinc-600 px-3 py-2
                                 text-xs font-semibold text-white
                                 outline-2 outline-offset-2 transition-colors hover:bg-gray-900 active:bg-gray-800 active:text-white/80"
              >
                <span>{transStatus?.status ?? "Sending"}</span>
                <span className="h-5 w-5 rounded-full bg-cyan-400"></span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between px-6">
            <input
              aria-label="deposit"
              className="m-0 h-auto w-[50%] grow border-none bg-transparent p-0 text-3xl placeholder:m-0 placeholder:p-0 placeholder:text-3xl focus:border-none focus:ring-0"
              placeholder={"0 " + transferParams.tokenSymbol}
              ref={sendInputRef}
              disabled={!tronWalletAddress.length}
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
          <div className="flex items-center px-6">
            <input
              aria-label="receive"
              disabled
              className="m-0 h-auto w-[50%] grow border-none bg-transparent p-0 text-3xl placeholder:m-0 placeholder:p-0 placeholder:text-3xl focus:border-none focus:ring-0"
              placeholder={`0 ${transferParams.toChain}`}
              type="number"
              value={
                convertWeiToEth(
                  transferRoute?.quote.amount! ?? 0,
                  transferParams.toChainDecimal,
                ) || `0 ${transferParams.toChain}`
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
          <p className="m-0 p-0 px-6 text-sm text-zinc-950/[0.6]">
            You will receive: {formatUSD(transferRoute?.quote?.amountUSD! ?? 0)}
          </p>
          <div className="px-6">
            <label htmlFor="wallet" className="mb-1 block font-semibold">
              Select Route <span className="text-red-500">*</span>
            </label>
            <select
              id="route"
              ref={selectRef}
              className="w-full rounded border border-gray-300 p-2"
              onChange={(e) => {
                setTransferRoute(
                  quotes?.at(Number(e.currentTarget.value)) ?? null,
                );
              }}
            >
              <option value={"NON"}>No Route Selected</option>
              {quotes?.map((route, index) => (
                <option value={route.quote.integration} key={index}>
                  {route.quote.integration} (Fee: ${route.quote.bridgeFeeUSD})
                </option>
              ))}
            </select>
          </div>
          <div className="px-6">
            <label htmlFor="wallet" className="mb-1 block font-semibold">
              Send to {transferParams.toChain} wallet{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="wallet"
              className="w-full rounded border border-gray-300 p-2"
              placeholder={`Enter your ${transferParams.toChain} wallet address`}
            />
          </div>
        </div>
        <div className="px-6 py-4">
          <button
            disabled={
              (connectionStatus === "connected" && isLoading) ||
              (connectionStatus === "connected" && isTransacting) ||
              (connectionStatus === "connected" && !transferRoute)
            }
            className={clsx(
              "mt-6 w-full rounded-xl bg-purple-800 px-2 py-4 font-semibold text-white transition-colors hover:bg-purple-600 ",
              {
                "hover:bg-blue-200":
                  connectionStatus === "connected" && transferRoute,
                "opacity-30":
                  (isLoading || !transferRoute || isTransacting) &&
                  connectionStatus === "connected",
              },
            )}
            onClick={() =>
              connectionStatus === "connected"
                ? startTransfer()
                : connectWallet()
            }
          >
            <h4 className="w-full font-bold text-white">
              <>
                {connectionStatus === "connected"
                  ? isLoading && !transferRoute
                    ? "FETCHING QUOTE"
                    : `START TRANSFER`
                  : "CONNECT ETHEREUM WALLET"}
                {(isLoading || isTransacting) && (
                  <FontAwesomeIcon className="ml-2" icon={faCircleNotch} spin />
                )}
              </>
            </h4>
          </button>
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
