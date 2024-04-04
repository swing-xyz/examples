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

import { LiaExchangeAltSolid } from "react-icons/lia";

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

const Swap = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<TransferStepResult | null>(null);
  const [results, setResults] = useState<TransferStepResults | null>(null);
  const [transferParams, setTransferParams] = useState<TransferParams>(
    defaultTransferParams,
  );
  const [transferRoute, setTransferRoute] = useState<TransferRoute | null>(
    null,
  );
  const connect = useConnect();
  const walletInstance = useWallet();
  const [swingSDK, setSwingSDK] = useState<SwingSDK | null>(null);
  const isConnected = swingSDK?.wallet.isConnected();

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
      const connection = await connect(walletConfig, { chainId });
      const signer = await connection.getSigner();

      // Connect wallet signer to Swing SDK
      const walletAddress = await swingSDK.wallet.connect(
        signer,
        defaultTransferParams.fromChain,
      );

      setTransferParams((prev) => {
        return {
          ...prev,
          fromUserAddress: walletAddress,
          toUserAddress: walletAddress,
        };
      });
    } catch (error) {
      console.error("Connect Wallet Error:", error);
      setError((error as Error).message);
    }
  }

  async function switchChain(chain: Chain) {
    if (!swingSDK) return;

    try {
      await walletInstance?.switchChain(chain.chainId);
      const walletSigner = await walletInstance?.getSigner();

      // Connect wallet signer to Swing SDK
      const walletAddress = await swingSDK.wallet.connect(
        walletSigner,
        chain.slug,
      );

      setTransferParams((prev) => {
        return {
          ...prev,
          fromUserAddress: walletAddress,
          toUserAddress: walletAddress,
        };
      });
    } catch (error) {
      console.error("Switch Chain Error:", error);
      setError((error as Error).message);
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
    } catch (error) {
      console.error("Quote Error:", error);
      setError((error as Error).message);
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
      },
    );

    setIsLoading(true);

    try {
      await swingSDK.transfer(transferRoute, transferParams);
    } catch (error) {
      console.error("Transfer Error:", error);
      setError((error as Error).message);
    }

    // Close the transfer listener
    transferListener();
    setIsLoading(false);
  }

  return (
    <div className="w-[80%] px-5 py-7 bg-black rounded-2xl">
      <div className="w-full flex gap-3">
        <div className="flex w-full items-center space-x-2 flex-2">
          <div className="flex w-full">
            <div className="w-full border-2 border-zinc-100 space-y-1 rounded-xl bg-zinc-950/[0.02] p-3">
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
                      value={transferParams.amount}
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
                <div className="flex items-center gap-3">
                  <img src="https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/PNG/btc.png" className="w-10 h-10" />
                  <div className="text-sm text-white">Bitcoin</div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-2 bg-zinc-200 rounded-2xl">
            <LiaExchangeAltSolid className="rounded-2xl w-8 h-8 text-zinc-300 font-bold text-black" />
          </div>
          <div className="flex w-full">
            <div className="w-full border-2 border-zinc-100 space-y-1 rounded-xl bg-zinc-950/[0.02] p-3">
              <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <div className="text-sm text-white">Ethereum</div>
                  <img src="https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/PNG/eth.png" className="w-10 h-10" />
                </div>
                <div className="flex flex-col">
                  <h4 className="w-full text-[11px] font-bold text-zinc-300 text-right">
                    You get
                  </h4>
                  <div className="flex justify-between items-center">
                    <input
                      aria-label="deposit"
                      className="border-none text-white text-right w-full h-auto bg-transparent focus:border-none focus:ring-0 placeholder:m-0 placeholder:p-0 placeholder:text-lg p-0 m-0"
                      placeholder={"0"}
                      value={transferParams.amount}
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

        <Button
            className={clsx("flex items-center cursor-pointer bg-zinc-600", {
              "opacity-60": isLoading,
            })}
            disabled={isLoading}
            onClick={() => connectWallet()}
          >
            Connect
          </Button>
      </div>

    </div>
    // <div className="w-full max-w-2xl p-5 m-auto space-y-4 rounded-md lg:ml-auto lg:w-80">
    //   <div>
    //     <label
    //       htmlFor="amount"
    //       className="block text-sm font-medium text-gray-700"
    //     >
    //       Amount
    //     </label>
    //     <div className="relative flex items-center mt-1">
    //       <input
    //         type="number"
    //         name="amount"
    //         id="amount"
    //         className="block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
    //         placeholder="0.0"
    //         value={transferParams.amount}
    //         onChange={(e) => {
    //           setTransferRoute(null); // Reset transfer route
    //           setTransferParams((prev) => ({
    //             ...prev,
    //             amount: e.currentTarget.value,
    //           }));
    //         }}
    //       />
    //       <div className="absolute right-3">{transferParams.fromToken}</div>
    //     </div>
    //   </div>

    //   <div>
    //     {isConnected ? (
    //       <Button
    //         className={clsx("flex items-center cursor-pointer", {
    //           "opacity-60": isLoading,
    //         })}
    //         disabled={isLoading}
    //         onClick={() => (transferRoute ? startTransfer() : getQuote())}
    //       >
    //         {transferRoute ? "Start transfer" : "Find the best price"}
    //         {isLoading && (
    //           <FontAwesomeIcon className="ml-2" icon={faCircleNotch} spin />
    //         )}
    //       </Button>
    //     ) : (
          // <Button
          //   className={clsx("flex items-center cursor-pointer", {
          //     "opacity-60": isLoading,
          //   })}
          //   disabled={isLoading}
          //   onClick={() => connectWallet()}
          // >
          //   Connect Wallet
          // </Button>
    //     )}

    //     {transferRoute && (
    //       <div className="grid grid-cols-2 gap-4 mt-4">
    //         <div>
    //           <label className="block text-sm font-medium text-gray-700">
    //             From
    //           </label>
    //           <div className="font-medium capitalize">
    //             {transferParams.fromChain} / {transferParams.fromToken}
    //           </div>
    //         </div>

    //         <div>
    //           <label className="block text-sm font-medium text-gray-700">
    //             To
    //           </label>
    //           <div className="font-medium capitalize">
    //             {transferParams.toChain} / {transferParams.toToken}
    //           </div>
    //         </div>

    //         <div>
    //           <label className="block text-sm font-medium text-gray-700">
    //             Gas Fee
    //           </label>
    //           <div className="font-medium capitalize">
    //             {formatUSD(transferRoute.gasUSD)}
    //           </div>
    //         </div>

    //         <div>
    //           <label className="block text-sm font-medium text-gray-700">
    //             Total
    //           </label>
    //           <div className="font-medium capitalize">
    //             {formatUSD(transferRoute.quote.amountUSD)}
    //           </div>
    //         </div>
    //       </div>
    //     )}

    //     <div className="mt-4">
    //       {status && (
    //         <div className="mt-2">
    //           <label className="block text-sm font-medium text-gray-700">
    //             Transfer Status
    //           </label>
    //           <div className="capitalize">
    //             {status.step}: <b>{status.status || results?.status || ""}</b>
    //           </div>
    //         </div>
    //       )}

    //       {status?.status === "FAILED" || error ? (
    //         <div className="mt-2">
    //           <label className="block text-sm font-medium text-gray-700">
    //             Error
    //           </label>{" "}
    //           <div className="text-red-500 capitalize">
    //             {status?.status === "FAILED" ? status.error : error}
    //           </div>
    //         </div>
    //       ) : null}
    //     </div>
    //   </div>
    // </div>
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
