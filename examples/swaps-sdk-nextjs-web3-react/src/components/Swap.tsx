"use client";

import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SwingSDK, {
  TransferStepResults,
  TransferStepResult,
  TransferRoute,
  TransferParams,
  Chain,
} from "@swing.xyz/sdk";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { useConnect, useWallet, metamaskWallet } from "@thirdweb-dev/react";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from '@ethersproject/providers';

const walletConfig = metamaskWallet();

const defaultTransferParams: TransferParams = {
  amount: "1",
  fromChain: "goerli",
  fromToken: "ETH",
  fromUserAddress: "",
  toChain: "goerli",
  toToken: "USDC",
  toUserAddress: "",
};

async function getLibrary(provider: any) {
  return new Web3Provider(provider);
}

const Swap = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<TransferStepResult | null>(null);
  const [results, setResults] = useState<TransferStepResults | null>(null);
  const [transferParams, setTransferParams] = useState<TransferParams>(
    defaultTransferParams
  );
  const [transferRoute, setTransferRoute] = useState<TransferRoute | null>(
    null
  );
  const { connector, provider } = useWeb3React();

  const [swingSDK, setSwingSDK] = useState<SwingSDK | null>(null);
  const isConnected = swingSDK?.wallet.isConnected();

  useEffect(() => {
    async function syncProviderWithSwingSDK() {
        const walletAddress = await swingSDK?.wallet.connect(provider?.getSigner(), defaultTransferParams.fromChain);

        setTransferParams((prev: any) => {
          return {
            ...prev,
            fromUserAddress: walletAddress,
            toUserAddress: walletAddress,
          };
        });
    }

    syncProviderWithSwingSDK();
}, [provider]);

  useEffect(() => {
    const swing = new SwingSDK({
      projectId: "example-swaps-sdk-nextjs",
      environment: "testnet",
      debug: true,
    });

    setIsLoading(true);

    swing
      .init()
      .then(() => {
        setIsLoading(false);
        setSwingSDK(swing);
      })
      .catch((error) => {
        setIsLoading(false);
        setError(error.message);
        setSwingSDK(swing);
      });
  }, []);

  async function connectWallet(chainId?: number) {
    if (!swingSDK) return;

    try {
      // Connect to MetaMask
      await connector.activate();

      const signer = await provider?.getSigner();

      // Connect wallet signer to Swing SDK
      const walletAddress = await swingSDK.wallet.connect(
        provider,
        defaultTransferParams.fromChain
      );

      setTransferParams((prev) => {
        return {
          ...prev,
          fromUserAddress: walletAddress,
          toUserAddress: walletAddress,
        };
      });
    } catch (error: any) {
      console.error("Connect Wallet Error:", error);
      setError(error.message);
    }
  }

  async function switchChain(chain: Chain) {
    if (!swingSDK) return;

    try {

      await connector.activate({
        chainId: chain.id
      });
    } catch (error: any) {
      console.error("Switch Chain Error:", error);
      setError(error.message);
    }
  }

  async function getQuote() {
    if (!swingSDK) return;

    setIsLoading(true);

    try {
      // Get a quote from the Swing API
      const quotes = await swingSDK.getQuote(transferParams);

      if (!quotes.routes.length) {
        setError("No routes available. Try a different token pair.");
        setIsLoading(false);
        return;
      }

      setTransferRoute(quotes.routes[0]!);
    } catch (error: any) {
      console.error("Quote Error:", error);
      setError(error.message);
    }

    setIsLoading(false);
  }

  async function startTransfer() {
    if (!swingSDK) return;

    if (!transferRoute) {
      setError("Choose a transfer route first.");
      return;
    }

    const transferListener = swingSDK.on(
      "TRANSFER",
      async (transferStepStatus, transferResults) => {
        setStatus(transferStepStatus);
        setResults(transferResults);

        console.log("TRANSFER:", transferStepStatus, transferResults);

        switch (transferStepStatus.status) {
          case "CHAIN_SWITCH_REQUIRED":
            await switchChain(transferStepStatus.chain);
            break;

          case "WALLET_CONNECTION_REQUIRED":
            await connectWallet(transferStepStatus.chain.chainId);
            break;
        }
      }
    );

    setIsLoading(true);

    try {
      await swingSDK.transfer(transferRoute, transferParams);
    } catch (error: any) {
      console.error("Transfer Error:", error);
      setError(error.message);
    }

    // Close the transfer listener
    transferListener();
    setIsLoading(false);
  }

  return (
    <div
      id="#altcoin"
      className="w-full max-w-2xl p-5 m-auto space-y-4 bg-white border rounded-md lg:ml-auto lg:w-80"
    >
      <div className="text-lg font-bold">Swap for $ALTCOIN</div>

      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Amount
        </label>
        <div className="relative flex items-center mt-1">
          <input
            type="number"
            name="amount"
            id="amount"
            className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="0.0"
            value={transferParams.amount}
            onChange={(e: any) => {
              setTransferRoute(null); // Reset transfer route
              setTransferParams((prev) => ({
                ...prev,
                amount: e.target.value,
              }));
            }}
          />
          <div className="absolute right-3">{transferParams.fromToken}</div>
        </div>
      </div>

      <div>
        {isConnected ? (
          <Button
            className={clsx("flex items-center cursor-pointer", {
              "opacity-60": isLoading,
            })}
            disabled={isLoading}
            onClick={() => (transferRoute ? startTransfer() : getQuote())}
          >
            {transferRoute ? "Start transfer" : "Find the best price"}
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
            Connect Wallet
          </Button>
        )}

        {transferRoute && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                From
              </label>
              <div className="font-medium capitalize">
                {transferParams.fromChain} / {transferParams.fromToken}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                To
              </label>
              <div className="font-medium capitalize">
                {transferParams.toChain} / {transferParams.toToken}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gas Fee
              </label>
              <div className="font-medium capitalize">
                {formatUSD(transferRoute.gasUSD)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total
              </label>
              <div className="font-medium capitalize">
                {formatUSD(transferRoute.quote.amountUSD)}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          {status && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Transfer Status
              </label>
              <div className="capitalize">
                {status.step}: <b>{status.status || results?.status || ""}</b>
              </div>
            </div>
          )}

          {status?.status === "FAILED" || error ? (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Error
              </label>{" "}
              <div className="text-red-500 capitalize">
                {status?.status === "FAILED" ? status.error : error}
              </div>
            </div>
          ) : null}
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
