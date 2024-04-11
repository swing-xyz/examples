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
import { useWeb3React } from "@web3-react/core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { useToast } from "@/ui/use-toast";
import { LiaExchangeAltSolid } from "react-icons/lia";
import { StatusSheet } from "./ui/StatusSheet";

const defaultTransferParams: TransferParams = {
  amount: "1",
  fromChain: "polygon",
  fromToken: "MATIC",
  fromUserAddress: "",
  toChain: "polygon",
  toToken: "USDC",
  toUserAddress: "",
};

const Swap = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [routes, setRoutes] = useState<TransferRoute[] | null>();
  const [status, setStatus] = useState<TransferStepResult | null>(null);
  const [results, setResults] = useState<TransferStepResults | null>(null);
  const [resultLogs, setResultLogs] = useState<
    { time: string; log?: string; logType?: string }[] | null
  >([]);
  const [transferParams, setTransferParams] = useState<TransferParams>(
    defaultTransferParams,
  );
  const [transferRoute, setTransferRoute] = useState<TransferRoute | null>(
    null,
  );

  const { connector, provider } = useWeb3React();

  const [swingSDK, setSwingSDK] = useState<SwingSDK | null>(null);
  const isConnected = swingSDK?.wallet.isConnected();

  const { toast } = useToast();

  useEffect(() => {
    async function syncProviderWithSwingSDK() {
      const walletAddress = await swingSDK?.wallet.connect(
        provider?.getSigner(),
        defaultTransferParams.fromChain,
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setTransferParams((prev: TransferParams | any) => ({
        ...prev,
        fromUserAddress: walletAddress,
        toUserAddress: walletAddress,
      }));
    }

    syncProviderWithSwingSDK();
  }, [provider]);

  useEffect(() => {
    const swing = new SwingSDK({
      projectId: "replug",
      environment: "production",
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
        showError(error.message);
        setSwingSDK(swing);
      });
  }, []);

  function showError(description: string) {
    toast({
      title: "An Error Occured",
      variant: "destructive",
      description,
    });
  }

  async function connectWallet() {
    if (!swingSDK) return;

    try {
      // Connect to MetaMask
      await connector.activate();
    } catch (error) {
      console.error("Connect Wallet Error:", error);
      showError((error as Error).message);
    }
  }

  async function switchChain(chain: Chain) {
    if (!swingSDK) return;

    try {
      // await connector.activate({chainId: chain.id,
      //   chainName: chain.name,
      //   nativeCurrency: chain.nativeToken,
      //   rpcUrls: [chain.rpcUrl]}) // <--- To suggest user add chain to wallet
      await connector.activate(chain.id);
    } catch (error) {
      console.error("Switch Chain Error:", error);
      showError((error as Error).message);
    }
  }

  async function getQuote() {
    if (!swingSDK) return;

    setIsLoading(true);

    try {
      // Get a quote from the Swing API
      const quotes = await swingSDK.getQuote(transferParams);

      if (!quotes.routes.length) {
        showError("No routes available. Try a different token pair.");
        setIsLoading(false);
        return;
      }

      // setTransferRoute(quotes.routes[0]!);
      setRoutes(quotes.routes);
    } catch (error) {
      console.error("Quote Error:", error);
      showError((error as Error).message);
    }

    setIsLoading(false);
  }

  async function startTransfer() {
    if (!swingSDK) return;

    if (!transferRoute) {
      showError("Choose a transfer route first.");
      return;
    }

    const transferListener = swingSDK.on(
      "TRANSFER",
      async (transferStepStatus, transferResults) => {
        setResultLogs((prevItems) => [
          ...prevItems!,
          {
            time: new Date().toISOString(),
            log: `Transaction Status -> ${transferStepStatus.status}`,
            logType: "MESSAGE",
          },
          {
            time: new Date().toISOString(),
            log: `Transfer Step -> ${transferStepStatus.step}`,
            logType: "MESSAGE",
          },
        ]);

        setStatus(transferStepStatus);
        setResults(transferResults);

        console.log("TRANSFER:", transferStepStatus, transferResults);

        switch (transferStepStatus.status) {
          case "ACTION_REQUIRED":
            setResultLogs((prevItems) => [
              ...prevItems!,
              {
                time: new Date().toISOString(),
                log: `ACTION REQUIRED: Prompting MetaMask`,
                logType: "ACTION_REQUIRED",
              },
            ]);
            break;
          case "CHAIN_SWITCH_REQUIRED":
            setResultLogs((prevItems) => [
              ...prevItems!,
              {
                time: new Date().toISOString(),
                log: `CHAIN SWITCH REQUIRED: Prompting MetaMask`,
                logType: "CHAIN_SWITCH",
              },
            ]);
            await switchChain(transferStepStatus.chain);
            break;

          case "WALLET_CONNECTION_REQUIRED":
            await connectWallet();
            break;
        }
      },
    );

    setIsLoading(true);

    try {
      await swingSDK.transfer(transferRoute, transferParams);
    } catch (error) {
      console.error("Transfer Error:", error);
      setResultLogs((prevItems) => [
        ...prevItems!,
        {
          time: new Date().toISOString(),
          log: `Error -> ${(error as Error).message}`,
          logType: "ERROR",
        },
      ]);
    }

    // Close the transfer listener
    transferListener();
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col gap-3 items-center justify-center">
      <h3 className="mt-5 text-sm">Bridge your MATIC to the Rapid Network</h3>
      <div className="w-full flex border-2 rounded-xl border-zinc-100">
        <div className="w-full flex justify-between items-center p-1">
          <div className="flex mr-auto space-x-1 items-center hover:bg-zinc-300/[0.2] hover:rounded-lg hover:cursor-pointer p-3">
            <img
              src={
                "https://raw.githubusercontent.com/polkaswitch/assets/master/blockchains/polygon/info/logo.png"
              }
              alt={""}
              className="rounded-full w-7 h-7"
            />
            <div className="flex flex-col">
              <h5 className="text-gray-400 font-bold text-[9px]">From</h5>
              <h5 className="font-bold text-[10px] capitalize">MATIC</h5>
            </div>
          </div>
          <div className="flex mx-auto justify-center p-3 group">
            <LiaExchangeAltSolid className="rounded-2xl w-5 h-5 text-zinc-300 font-bold" />
          </div>
          <div className="flex ml-auto space-x-1 items-center hover:bg-zinc-300/[0.2] hover:rounded-lg hover:cursor-pointer p-3">
            <div className="flex flex-col">
              <h5 className="text-gray-400 font-bold text-[9px] text-right">
                To
              </h5>
              <h5 className="font-bold text-[10px] capitalize">USDC</h5>
            </div>
            <img
              src={
                "https://s3.ap-northeast-1.amazonaws.com/platform.swing.xyz/assets/usdc/0c7e4c2dc978757682eed00e438afa3eab3a97bdb63ad57abfbb9d79eb42f006.png"
              }
              alt={""}
              className="rounded-full w-7 h-7"
            />
          </div>
        </div>
      </div>
      <div className="flex w-full space-x-2">
        <div className="flex w-full">
          <div className="w-full flex flex-col border-2 border-zinc-100 space-y-1 rounded-xl bg-zinc-950/[0.02] p-3">
            <h4 className="w-full text-[11px] font-bold text-zinc-300">Send</h4>
            <div className="flex justify-between items-center">
              <input
                aria-label="deposit"
                className="border-none w-[50%] h-auto bg-transparent focus:border-none focus:ring-0 placeholder:m-0 placeholder:p-0 placeholder:text-lg p-0 m-0"
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
              <div className="text-xs">MATIC</div>
            </div>
          </div>
        </div>
        <div className="flex w-full">
          <div className="w-full flex flex-col border-2 border-zinc-100 space-y-1 rounded-xl bg-zinc-950/[0.02] p-3">
            <h4 className="w-full text-[11px] font-bold text-zinc-300">
              You get
            </h4>
            <div className="flex justify-between items-center">
              <input
                aria-label="receive"
                className="border-none w-[50%] h-auto bg-transparent focus:border-none focus:ring-0 placeholder:m-0 placeholder:p-0 placeholder:text-lg p-0 m-0"
                placeholder={"0"}
                value={transferRoute?.quote?.amountUSD! ?? 0}
                type="number"
              />

              <div className="text-xs">USD</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <Select
          onValueChange={(e) =>
            setTransferRoute(
              routes?.filter((route) => route.quote.integration === e)[0]!,
            )
          }
        >
          <SelectTrigger className="w-[180px] bg-zinc-900 w-full">
            <SelectValue placeholder="Select Route" className="bg-zinc-900" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900">
            {routes?.map((route) => (
              <SelectItem
                key={route.quote.integration}
                value={route.quote.integration}
                className="hover:text-zinc-900"
              >
                {route.quote.integration}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isConnected ? (
        <Button
          className={clsx("w-full flex items-center cursor-pointer", {
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
          className={clsx("w-full flex items-center cursor-pointer", {
            "opacity-60": isLoading,
          })}
          disabled={isLoading}
          onClick={() => connectWallet()}
        >
          Connect Wallet
        </Button>
      )}

      <StatusSheet
        isOpen={!!status}
        logs={resultLogs!}
        onCancel={async () => {
          await swingSDK?.cancelTransfer(results?.transferId!);
          setStatus(null);
        }}
      />
    </div>
  );
};

export default Swap;
