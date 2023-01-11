import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SwingSDK, { TransferStatus } from "@swing.xyz/sdk";
import clsx from "clsx";
import { useState } from "react";
import { Button } from "./Button";

const Swap = () => {
  const [amount, setAmount] = useState();
  const [error, setError] = useState("");
  const [status, setStatus] = useState<TransferStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (typeof window !== "undefined") {
    console.log(window.ethereum);
  }

  return (
    <div
      id="#altcoin"
      className="p-5 ml-auto space-y-4 bg-white border rounded-md w-80"
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
            value={amount}
            onChange={(e: any) => setAmount(e.currentTarget.value)}
          />
          <div className="absolute right-3">Ethereum / USDC</div>
        </div>
      </div>

      <div>
        <Button
          className={clsx("flex items-center cursor-pointer", {
            "opacity-60": isLoading,
          })}
          disabled={isLoading}
          onClick={async () => {
            setIsLoading(true);

            const swingSDK = new SwingSDK({});

            swingSDK.on("TRANSFER", (transferStatus) => {
              setStatus(transferStatus);
            });

            const metmask = (window.ethereum as any)?.providers.find(
              (p: any) => p.isMetaMask
            );
            if (!metmask) {
              setError("Metamask not connected. Do you have it installed?");
              setIsLoading(false);
              return;
            }

            await metmask.request({
              method: "eth_requestAccounts",
            });

            const fromUserAddress = await swingSDK.wallet.connect(
              metmask,
              "ethereum"
            );

            const quotes = await swingSDK.getQuote({
              amount: String(amount),
              fromChain: "ethereum",
              fromToken: "USDC",
              toChain: "polygon",
              toToken: "USDC",
              fromUserAddress,
              toUserAddress: fromUserAddress,
            });

            if (!quotes.routes.length) {
              setError("No routes found");
              setIsLoading(false);
              return;
            }

            const route = quotes.routes[0];

            try {
              await swingSDK.transfer(route, {
                amount: String(amount),
                fromChain: "ethereum",
                fromToken: "USDC",
                toChain: "polygon",
                toToken: "USDC",
                fromUserAddress,
                toUserAddress: fromUserAddress,
              });
            } catch (error: any) {
              setError(error.message);
            }

            setIsLoading(false);
          }}
        >
          Swap for $ALTCOIN
          {isLoading && (
            <FontAwesomeIcon className="ml-2" icon={faCircleNotch} spin />
          )}
        </Button>

        <div className="mt-4">
          {status && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="capitalize">
                {status.step}: <b>{status.status}</b>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Error
              </label>{" "}
              <div className="text-red-500">{error}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Swap;
