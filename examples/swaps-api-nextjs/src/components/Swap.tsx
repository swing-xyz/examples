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
import { getQuoteRequest, sendTransactionRequest } from "services/requests";
import { convertEthToWei, convertWeiToEth } from "utils/ethToWei";

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

const Swap = () => {
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState("");
  const [transferParams, setTransferParams] = useState<TranferParams>(
    defaultTransferParams,
  );

  const [transferRoute, setTransferRoute] = useState<Route | null>(null);

  const connect = useConnect();
  const address = useAddress();

  const connectionStatus = useConnectionStatus();
  const walletAddress = useAddress();
  const signer = useSigner();

  useEffect(() => {
    setTransferParams((prev) => {
      return {
        ...prev,
        fromUserAddress: walletAddress!,
      };
    });
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
      // setError((error as Error).message);
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
        // setError("No routes available. Try a different token pair.");
        setIsLoading(false);
        return;
      }

      setTransferRoute(quotes.routes[0]!);

      console.log(transferRoute);
    } catch (error) {
      console.error("Quote Error:", error);
      // setError((error as Error).message);
    }

    setIsLoading(false);
  }

  async function startTransfer() {
    if (!transferRoute) {
      // setError("Choose a transfer route first.");
      return;
    }

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

      console.log(transfer);

      let txData: any = {
        data: transfer.tx.data,
        from: transfer.tx.from,
        to: transfer.tx.to,
        value: transfer.tx.value,
        gasLimit: transfer.tx.gas,
      }

      if(transfer.tx.meta) {

        const { from, recipient, amount, memo } = transfer.tx.meta;

        (window.xfi as any)?.bitcoin.request(
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
          (error: any, result: any) => {
            console.debug(error, result);
          }
        );

        txData = {
          from,
          to: recipient,
          amount: amount,
          data: memo,
        };
      } else {

        const txResponse = await signer?.sendTransaction(txData);
        console.log("Transaction response:", txResponse);

        // Wait for the transaction to be mined
        const receipt = await txResponse?.wait();
        console.log("Transaction receipt:", receipt);
      }

      
    } catch (error) {
      console.error("Transfer Error:", error);
      // setError((error as Error).message);
    }

    setIsLoading(false);
  }

  return (
    <div className="flex flex-col gap-y-4 w-auto px-5 py-7 bg-cyan-400 rounded-2xl border-8 border-cyan-200">
      <div className="w-full justify-center flex gap-3">
        <div className="flex w-auto items-center space-x-2 flex-2">
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
                      // value={transferParams.tokenAmount}
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
          <div
            className="p-1 bg-zinc-200 rounded-2xl hover:cursor-pointer"
            onClick={async () => {
              const {
                fromChain,
                fromTokenAddress,
                fromUserAddress,
                tokenSymbol,
                fromTokenIconUrl,
                fromChainDecimal,
              } = transferParams;

              const {
                toChain,
                toTokenAddress,
                toUserAddress,
                toTokenSymbol,
                toTokenIconUrl,
                toChainDecimal,
              } = transferParams;

              const [
                tempFromChain,
                tempFromTokenAddress,
                tempFromUserAddress,
                tempTokenSymbol,
                tempFromTokenUrl,
                tempFromChainDecimal,
              ] = [
                fromChain,
                fromTokenAddress,
                fromUserAddress,
                tokenSymbol,
                fromTokenIconUrl,
                fromChainDecimal,
              ];

              setTransferParams((prev) => ({
                ...prev,
                fromChain: toChain,
                fromTokenAddress: toTokenAddress!,
                fromUserAddress: toUserAddress!,
                tokenSymbol: toTokenSymbol!,
                fromTokenIconUrl: toTokenIconUrl,
                fromChainDecimal: toChainDecimal,

                toChain: tempFromChain,
                toTokenAddress: tempFromTokenAddress,
                toUserAddress: tempFromUserAddress,
                toTokenSymbol: tempTokenSymbol,
                toTokenIconUrl: tempFromTokenUrl,
                toChainDecimal: tempFromChainDecimal,
              }));

              await getQuote();
            }}
          >
            <LiaExchangeAltSolid className="rounded-2xl w-8 h-8 font-bold text-black" />
          </div>
          <div className="flex w-full">
            <div className="w-auto border-8 border-cyan-500 space-y-1 rounded-xl bg-zinc-900 p-3">
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
          <Button
            className={clsx("flex items-center cursor-pointer bg-zinc-600", {
              "opacity-60": isLoading,
            })}
            disabled={isLoading}
            onClick={() => (transferRoute ? startTransfer() : getQuote())}
          >
            {transferRoute ? "Start transfer" : "Get Quote"}
            {isLoading && (
              <FontAwesomeIcon className="ml-2" icon={faCircleNotch} spin />
            )}
          </Button>
        ) : (
          <Button
            className={clsx("flex items-center cursor-pointer", {
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
        <div className="w-full flex justify-between items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-200">
              From
            </label>
            <div className="font-medium capitalize text-zinc-400">
              {transferParams.fromChain} / {transferParams.tokenSymbol}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-200">
              To
            </label>
            <div className="font-medium capitalize text-zinc-400">
              {transferParams.toChain} / {transferParams.toTokenSymbol}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-200">
              Gas Fee
            </label>
            <div className="font-medium capitalize text-zinc-400">
              {formatUSD(transferRoute?.gasUSD! ?? 0)}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-200">
              Total
            </label>
            <div className="font-medium capitalize text-zinc-400">
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
