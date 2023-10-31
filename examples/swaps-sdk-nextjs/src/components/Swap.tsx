"use client";

import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SwingSDK, {
  TransferStepResults,
  TransferStepResult,
  TransferRoute,
  TransferParams,
} from "@swing.xyz/sdk";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Button } from "./Button";

const swingSDK = new SwingSDK({
  projectId: "example-swaps-sdk-nextjs",
  environment: "testnet",
});

const Swap = () => {
  const metamask =
    typeof window !== "undefined" ? (window.ethereum as any) : undefined;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<TransferStepResult | null>(null);
  const [results, setResults] = useState<TransferStepResults | null>(null);
  const [transferParams, setTransferParams] = useState<TransferParams>({
    amount: "1",
    fromChain: "goerli",
    fromToken: "ETH",
    fromUserAddress: "",
    toChain: "goerli",
    toToken: "USDC",
    toUserAddress: "",
  });
  const [transferRoute, setTransferRoute] = useState<TransferRoute | null>(
    null
  );
  const isConnected = swingSDK.wallet.isConnected();

  useEffect(() => {
    setIsLoading(true);
    swingSDK
      .init()
      .then(() => {
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        setError(error.message);
      });
  }, []);

  async function connectWallet() {
    try {
      await metamask.request({
        method: "eth_requestAccounts",
      });

      const fromUserAddress = await swingSDK.wallet.connect(
        metamask,
        "ethereum"
      );

      setTransferParams({
        ...transferParams,
        fromUserAddress,
        toUserAddress: fromUserAddress,
      });
    } catch (error) {
      setError("Metamask not connected. Do you have it installed?");
    }
  }

  async function getQuote() {
    setIsLoading(true);

    try {
      const quotes = await swingSDK.getQuote(transferParams);

      if (!quotes.routes.length) {
        setError("No routes available. Try a different token pair.");
        setIsLoading(false);
        return;
      }

      setTransferRoute(quotes.routes[0]);
    } catch (error: any) {
      console.error("Quote Error", error);
      setError(error.message);
    }

    setIsLoading(false);
  }

  async function startTransfer() {
    if (!transferRoute) {
      setError("Choose a transfer route first.");
      return;
    }

    swingSDK.on("TRANSFER", async (transferStepStatus, transferResults) => {
      setStatus(transferStepStatus);
      setResults(transferResults);

      console.log("TRANSFER", transferStepStatus, transferResults);

      switch (transferStepStatus.status) {
        case "CHAIN_SWITCH_REQUIRED":
          await metamask.request({
            method: "wallet_switchEthereumChain",
            params: [
              {
                chainId: `0x${Number(transferStepStatus.chain.chainId).toString(
                  16
                )}`,
              },
            ],
          });
          break;

        case "WALLET_CONNECTION_REQUIRED":
          await metamask.request({
            method: "wallet_requestPermissions",
            params: [{ eth_accounts: {} }],
          });
          break;
      }
    });

    setIsLoading(true);

    try {
      await swingSDK.transfer(transferRoute, transferParams);
    } catch (error: any) {
      setError(error.message);
    }

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
              setTransferParams({
                ...transferParams,
                amount: e.currentTarget.value,
              });
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
                ${transferRoute.gasUSD}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total
              </label>
              <div className="font-medium capitalize">
                ${transferRoute.quote.amountUSD}
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
                {status.step}: <b>{status.status}</b>
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

export default Swap;
