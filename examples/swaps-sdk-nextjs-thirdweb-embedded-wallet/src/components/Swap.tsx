"use client";

import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SwingSDK, {
  TransferStepResults,
  TransferStepResult,
  TransferRoute,
  TransferParams,
  Chain,
  Token,
  type TransferQuote,
} from "@swing.xyz/sdk";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Button } from "./ui/Button";
import { shortenAddress } from "@thirdweb-dev/react";
import { useCustomSwingSdk } from "./hooks/useSwingSDK";
import { useModal } from "./hooks/useModal";
import {
  MdCheckCircle,
  MdLocalGasStation,
  MdOutlineArrowDropDown,
  MdOutlineArrowForward,
  MdOutlineTimelapse,
  MdOutlineTransform,
} from "react-icons/md";

import { LiaExchangeAltSolid } from "react-icons/lia";
import { useDebouncedCallback } from "use-debounce";
import { openSelectChainModal } from "./ui/modals/SelectChainModal";
import { openSelectRouteModal } from "./ui/modals/SelectRouteModal";
import { useToast } from "@/ui/use-toast";
import { ToastAction } from "@radix-ui/react-toast";

function calculateTokenAmount({
  amount,
  decimals,
}: {
  amount: number;
  decimals: number;
}) {
  const amountBigInt = BigInt(amount);

  const divisor = BigInt(Math.pow(10, decimals));

  const actualAmount = amountBigInt / divisor;

  console.log(amount, decimals);

  return actualAmount.toString();
}

const Swap = () => {
  const {
    isConnected,
    swingSDK,
    setWalletAddress,
    embeddedWallet,
    setSwingSDK,
    walletAddress,
    setBalance,
    defaultTransferParams,
    setError,
    connectWallet,
    transferParams,
    setTransferParams,
  } = useCustomSwingSdk();

  const [isLoading, setIsLoading] = useState(false);
  const [_status, setStatus] = useState<TransferStepResult | null>(null);
  const [_results, setResults] = useState<TransferStepResults | null>(null);
  const [transferRoute, setTransferRoute] = useState<TransferRoute | null>(
    null,
  );
  const [receiveAmount, setReceiveAmount] = useState("");
  const [sendChains, setSendChains] = useState<Chain[]>();
  const [receiveChains, setReceiveChains] = useState<Chain[]>();
  const [fromChain, setFromChain] = useState<Chain>();
  const [toChain, setToChain] = useState<Chain>();
  const [fromToken, setFromToken] = useState<Token>();
  const [fromTokenBalance, setFromTokenBalance] = useState("0");
  const [toToken, setToToken] = useState<Token>();
  const [toTokenBalance, setToTokenBalance] = useState("0");
  const [toTokenLocalAmount, setToTokenLocalAmount] = useState("");
  const [quotes, setQuotes] = useState<TransferQuote["routes"]>([]);
  const modalContext = useModal();

  const { toast } = useToast();

  const debounced = useDebouncedCallback((value) => {
    setTransferParams((prev: TransferParams) => ({
      ...prev,
      amount: value,
    }));

    setReceiveAmount(
      calculateTokenAmount({
        amount: Number(transferRoute?.quote?.amount ?? 0),
        decimals: transferRoute?.quote?.decimals ?? 0,
      }),
    );
  }, 1000);

  useEffect(() => {
    setTimeout(() => getQuote(), 500);
  }, [transferParams.amount]);

  useEffect(() => {
    const swing = new SwingSDK({
      projectId: "replug",
      environment: "production",
      debug: true,
    });

    setIsLoading(true);

    swing
      .init()
      .then(async () => {
        setIsLoading(false);
        setSwingSDK(swing);

        const _sendChains = await swing.getAvailableSendChains({
          type: "swap",
        });
        // _sendChains = _sendChains.filter((chain: Chain) => allowedChains.includes(chain.slug));

        setSendChains(_sendChains);

        const _fromChain =
          _sendChains[Math.floor(Math.random() * _sendChains.length)];

        const _sendChainTokens = await swing.getAvailableSendTokens({
          type: "swap",
          fromChainSlug: _fromChain.slug,
        });
        console.log("send", _sendChainTokens);
        const _fromToken =
          _sendChainTokens[Math.floor(Math.random() * _sendChainTokens.length)];

        setFromToken(_fromToken);
        setFromChain(_fromChain);

        const _receiveChains = await swing.getAvailableReceiveChains({
          type: "swap",
          fromChainSlug: _fromChain.slug,
          fromTokenSymbol: _fromToken.symbol,
        });

        // _receiveChains = _receiveChains.filter((chain: Chain) => allowedChains.includes(chain.slug));
        setReceiveChains(_receiveChains);

        const _toChain =
          _receiveChains[Math.floor(Math.random() * _receiveChains.length)];

        const _receiveChainsTokens = await swing.getAvailableReceiveTokens({
          type: "swap",
          toChainSlug: _toChain.slug,
          fromChainSlug: _fromChain?.slug,
          fromTokenSymbol: _fromToken.symbol,
        });
        // .filter((token) => allowedTokens.includes(token.symbol));

        const _toToken =
          _receiveChainsTokens[
            Math.floor(Math.random() * _receiveChainsTokens.length)
          ];

        setToChain(_toChain);
        setToToken(_toToken);
      })
      .catch((error) => {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error.message,
          // action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
        setError(error.message);
        setSwingSDK(swing);
      });
  }, []);

  async function getTokenBalances() {
    if (toChain) {
      const _balance = await swingSDK?.wallet.getBalance(
        toChain?.slug,
        toToken?.symbol!,
        walletAddress,
      );
      setToTokenBalance(_balance!);
    }
    if (fromChain) {
      const _balance = await swingSDK?.wallet.getBalance(
        fromChain?.slug!,
        fromToken?.symbol!,
        walletAddress,
      );
      setFromTokenBalance(_balance!);
    }
  }

  async function switchChain(chain: Chain) {
    if (!swingSDK) return;

    try {
      console.log(embeddedWallet);
      await embeddedWallet?.switchChain(chain.chainId);
      const signer = await embeddedWallet?.getSigner();

      // Connect wallet signer to Swing SDK
      const walletAddress = await swingSDK.wallet.connect(signer, chain.slug);
      setWalletAddress(walletAddress);
      console.log(walletAddress);
      const balance = await swingSDK.wallet.getBalance(
        defaultTransferParams.fromChain,
        defaultTransferParams.fromToken,
        walletAddress,
      );
      setBalance(balance);

      setTransferParams((prev: TransferParams) => {
        return {
          ...prev,
          fromUserAddress: walletAddress,
          toUserAddress: walletAddress,
        };
      });
    } catch (error) {
      console.error("Switch Chain Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: (error as Error).message,
        action: (
          <ToastAction altText="Try again" onClick={() => switchChain(chain)}>
            Try again
          </ToastAction>
        ),
      });
      setError((error as Error).message);
    }
  }

  async function getQuote() {
    if (!swingSDK) return;

    setIsLoading(true);

    try {
      // Get a quote from the Swing API
      const _quotes = await swingSDK.getQuote(transferParams);

      console.log(_quotes);

      if (!_quotes.routes.length) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "No routes available. Try a different token pair.",
          action: (
            <ToastAction altText="Try again" onClick={() => openSendDialog()}>
              Change Chain
            </ToastAction>
          ),
        });
        setIsLoading(false);
        setQuotes([]);
        setTransferRoute(null);
        return;
      }

      const bestQuote = _quotes.routes.sort(
        (a, b) => Number(a.quote.amount) - Number(b.quote.amount),
      )[0];
      const quoteIntegration = swingSDK.getIntegration(
        bestQuote.quote.integration,
      );

      setToTokenLocalAmount(bestQuote?.quote?.amountUSD);

      setQuotes(_quotes.routes);
      setTransferRoute({ ...bestQuote, ...quoteIntegration });
    } catch (error) {
      console.error("Quote Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: (error as Error).message,
        action: (
          <ToastAction altText="Try again" onClick={() => openSendDialog()}>
            Change Chain
          </ToastAction>
        ),
      });
      setError((error as Error).message);
    }

    setIsLoading(false);
  }

  async function startTransfer() {
    if (!swingSDK) return;

    if (!transferRoute) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Choose a transfer route first.",
        action: (
          <ToastAction altText="Try again" onClick={() => openSendDialog()}>
            Choose Chain
          </ToastAction>
        ),
      });
      return;
    }

    const transferListener = swingSDK.on(
      "TRANSFER",
      async (transferStepStatus, transferResults) => {
        setStatus(transferStepStatus);
        toast({
          title: "Swapping!",
          description: transferStepStatus.status,
          action: (
            <ToastAction altText="Try again" onClick={() => {}}>
              Cancel
            </ToastAction>
          ),
        });
        setResults(transferResults);

        console.log("TRANSFER:", transferStepStatus, transferResults);

        switch (transferStepStatus.status) {
          case "CHAIN_SWITCH_REQUIRED":
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
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: (error as Error).message,
        action: (
          <ToastAction altText="Try again" onClick={() => startTransfer()}>
            Try again
          </ToastAction>
        ),
      });
      setError((error as Error).message);
    }

    // Close the transfer listener
    transferListener();
    setIsLoading(false);
  }

  const openReceiveDialog = () => {
    openSelectChainModal(modalContext, {
      chains: receiveChains ?? [],
      toChain,
      title: "Select Destination Chain",
      onChainAndTokenSelected: ({ chain, token }) => {
        setTransferParams((prev: TransferParams) => {
          return {
            ...prev,
            toChain: chain?.slug!,
            toToken: token?.symbol!,
          };
        });
        setToChain(chain!);
        setToToken(token!);
        getQuote();
        getTokenBalances();
        modalContext.closeModal();
      },
    });
  };

  const openSendDialog = () => {
    openSelectChainModal(modalContext, {
      chains: sendChains ?? [],
      title: "Select Source Chain",
      onChainAndTokenSelected: ({ chain, token }) => {
        setTransferParams((prev: TransferParams) => {
          return {
            ...prev,
            fromChain: chain?.slug!,
            fromToken: token?.symbol!,
          };
        });
        setReceiveChains(
          swingSDK?.getAvailableReceiveChains({
            fromChainSlug: chain?.slug!,
            fromTokenSymbol: token?.symbol!,
            type: "swap",
          }),
          // .filter((_chain) => allowedChains.includes(_chain.slug)),
        );
        setFromChain(chain!);
        setFromToken(token!);
        getQuote();
        getTokenBalances();
        modalContext.closeModal();
      },
    });
  };

  return (
    <div
      id="#altcoin"
      className="w-full max-w-4xl p-5 m-auto space-y-4 bg-white rounded-4xl lg:ml-auto md:w-[20rem] sm:w-[20rem] lg:w-[21rem]"
    >
      <div className="flex flex-col space-y-3">
        <div className="w-full flex justify-between items-center">
          <div className="text-lg font-bold italic">PowerSwap 🔥</div>
          <div className="flex min-w-5 min-h-5 rounded-4xl bg-gray-100">
            <div className="bg-black text-white rounded-4xl text-[9px] font-bold px-2 py-1.5">
              Swap
            </div>
            <div className=" text-gray-500 rounded-4xl text-[9px] font-bold px-2 py-1.5">
              Stake
            </div>
          </div>
        </div>

        <div className="w-full flex border-2 rounded-xl border-zinc-100">
          <div className="w-full flex justify-between items-center p-1">
            <div
              className="flex mr-auto space-x-1 items-center hover:bg-zinc-300/[0.2] hover:rounded-lg hover:cursor-pointer p-3"
              onClick={openSendDialog}
            >
              <img
                src={fromChain?.logo}
                alt={fromChain?.name}
                className="rounded-full w-7 h-7"
              />
              <div className="flex flex-col">
                <h5 className="text-gray-400 font-bold text-[9px]">From</h5>
                <h5 className="font-bold text-[10px] capitalize">
                  {fromChain?.name}
                </h5>
              </div>
            </div>
            <div
              className="flex mx-auto justify-center p-3 group hover:rounded-full hover:bg-zinc-100 hover:cursor-pointer"
              onClick={() => {
                const tempToChain = { ...toChain! };
                setToChain(fromChain);
                setFromChain(tempToChain);

                const tempToToken = { ...toToken! };
                setToToken(fromToken);
                setFromToken(tempToToken);

                const tempToTokenBalance = toTokenBalance;
                setToTokenBalance(fromTokenBalance);
                setFromTokenBalance(tempToTokenBalance);

                if (isConnected && swingSDK?.isReady) {
                  getQuote();
                }
              }}
            >
              <LiaExchangeAltSolid className="rounded-2xl w-5 h-5 text-zinc-300 group-hover:text-zinc-600 font-bold" />
            </div>
            <div
              className="flex ml-auto space-x-1 items-center hover:bg-zinc-300/[0.2] hover:rounded-lg hover:cursor-pointer p-3"
              onClick={openReceiveDialog}
            >
              <div className="flex flex-col">
                <h5 className="text-gray-400 font-bold text-[9px] text-right">
                  To
                </h5>
                <h5 className="font-bold text-[10px] capitalize">
                  {toChain?.name}
                </h5>
              </div>
              <img
                src={toChain?.logo}
                alt={toChain?.name}
                className="rounded-full w-7 h-7"
              />
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col border-2 border-zinc-100 space-y-1 rounded-xl bg-zinc-950/[0.02] p-3">
          <h4 className="w-full text-[11px] font-bold text-zinc-700">
            Deposit
          </h4>
          <div className="flex justify-between items-center">
            <input
              aria-label="deposit"
              className="border-none w-[50%] h-auto bg-transparent focus:border-none focus:ring-0 placeholder:m-0 placeholder:p-0 placeholder:text-lg p-0 m-0"
              placeholder={"0"}
              disabled={!isConnected}
              onChange={(e) => debounced(e.target.value)}
              type="number"
            />
            <div
              className="flex items-center space-x-1 bg-white p-2 rounded-xl hover:cursor-pointer"
              onClick={openSendDialog}
            >
              <img
                src={fromToken?.logo ?? ""}
                alt={fromToken?.symbol ?? defaultTransferParams.fromChain}
                className="rounded-full w-4 h-4"
              />
              <p className="text-zinc-800 text-xs">
                {fromToken?.symbol ?? <>USDC</>}
              </p>
              <MdOutlineArrowDropDown className="rounded-2xl w-5 h-5 text-zinc-300 font-bold" />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-xs p-0 m-0 text-zinc-950/[0.6]">
              {!transferRoute ? <>$0</> : <>{}</>}
            </p>
            <p className="text-[10px] p-0 m-0 text-zinc-950/[0.6]">
              {Number(fromTokenBalance).toFixed(3)}{" "}
              {fromToken?.symbol ?? <>USDC</>} available
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col border-2 border-zinc-100 space-y-2 rounded-xl bg-zinc-950/[0.02] p-3">
          <h4 className="w-full text-[11px] font-bold text-zinc-700">
            Receive
          </h4>
          <div className="flex justify-between items-center">
            <input
              aria-label="receive"
              disabled
              className="border-none w-[50%] h-auto bg-transparent focus:border-none focus:ring-0 placeholder:m-0 placeholder:p-0 placeholder:text-lg p-0 m-0"
              placeholder={"0"}
              type="number"
              value={receiveAmount}
            />
            <div
              className="flex items-center space-x-1 bg-white p-2 rounded-xl hover:cursor-pointer"
              onClick={openReceiveDialog}
            >
              <img
                src={toToken?.logo ?? ""}
                alt={toToken?.symbol ?? defaultTransferParams.fromChain}
                className="rounded-full w-4 h-4"
              />
              <p className="text-zinc-800 text-xs">
                {toToken?.symbol ?? <>USDC</>}
              </p>
              <MdOutlineArrowDropDown className="rounded-2xl w-5 h-5 text-zinc-300 font-bold" />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-xs p-0 m-0 text-zinc-950/[0.6]">
              {!transferRoute || receiveAmount === "0" ? (
                <>$0</>
              ) : (
                <>{formatUSD(toTokenLocalAmount)}</>
              )}
            </p>
            <p className="text-[10px] p-0 m-0 text-zinc-950/[0.6]">
              {Number(toTokenBalance).toFixed(3)} {toToken?.symbol ?? <>USDC</>}{" "}
              available
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col justify-between border-2 border-zinc-100 space-y-2 rounded-xl">
          <div className="flex justify-between items-center border-b">
            <div className="mr-auto flex items-center gap-1 px-2 py-1">
              <MdOutlineArrowForward className="w-3 h-3" />
              <p className="text-[10px] font-bold">To address</p>
            </div>
            <div className="flex items-center space-x-1 bg-white p-2 rounded-xl">
              {!isConnected ? (
                <>-</>
              ) : (
                <div className="flex space-x-1 bg-green-200 font-bold rounded-full text-[9px] text-green-600 px-2 py-1">
                  <p>{shortenAddress(walletAddress)}</p>
                  <MdCheckCircle className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center border-b my-0/!">
            <div className="mr-auto flex items-center gap-1 px-2 py-0">
              <MdOutlineTransform className="w-3 h-3" />
              <p className="text-[10px] font-bold">Route</p>
            </div>
            <div className="flex items-center space-x-1 bg-white p-2 rounded-xl">
              {!quotes.length ? (
                <>-</>
              ) : (
                <div
                  className="flex items-center w-full space-x-1 bg-red-200 font-bold rounded-full text-[10px] text-red-600 px-2 py-1 hover:cursor-pointer"
                  onClick={() => {
                    openSelectRouteModal(modalContext, {
                      title: "Select Route",
                      routes: quotes,
                      onRouteSelected(route) {
                        console.log(route);
                        setTransferRoute(route);
                        modalContext.closeModal();
                        getQuote();
                      },
                    });
                  }}
                >
                  <img
                    src={
                      swingSDK?.getIntegration(
                        transferRoute?.quote.integration!,
                      )?.logo
                    }
                    alt={transferRoute?.quote?.integration}
                    className="rounded-full w-3 h-3"
                  />
                  <p className="capitalize">
                    ⚡{transferRoute?.quote?.integration}
                  </p>
                  <MdOutlineArrowDropDown className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center border-b my-0/!">
            <div className="mr-auto flex items-center gap-1 px-2 py-0">
              <MdOutlineTimelapse className="w-3 h-3" />
              <p className="text-[10px] font-bold">Transfer Time</p>
            </div>
            <div className="flex items-center space-x-1 bg-white p-2 rounded-xl">
              {!transferRoute ? (
                <>-</>
              ) : (
                <div className="flex space-x-1 font-bold rounded-full text-[10px] px-2 py-1">
                  <p className="capitalize">
                    ~{transferRoute?.duration} mins 🔥
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center my-0/!">
            <div className="mr-auto flex items-center gap-1 px-2 py-0">
              <MdLocalGasStation className="w-3 h-3 text-green-500" />
              <p className="text-[10px] font-bold">Fees</p>
            </div>
            <div className="flex items-center space-x-1 bg-white p-2 rounded-xl">
              {!transferRoute ? (
                <>-</>
              ) : (
                <div className="flex space-x-1 font-bold rounded-full text-[10px] px-2 py-1">
                  <p className="capitalize">
                    {formatUSD(transferRoute.gasUSD)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="">
        {isConnected ? (
          <Button
            className={clsx("flex items-center cursor-pointer w-full mt-4", {
              "opacity-60": isLoading,
            })}
            disabled={isLoading || !(fromTokenBalance >= transferParams.amount)}
            onClick={() => (transferRoute ? startTransfer() : getQuote())}
          >
            {fromTokenBalance >= transferParams.amount
              ? "Start transfer"
              : "Insufficient Balance"}
            {isLoading && (
              <FontAwesomeIcon className="ml-2" icon={faCircleNotch} spin />
            )}
          </Button>
        ) : (
          <Button
            className={clsx("flex items-center cursor-pointer w-full", {
              "opacity-60": isLoading,
            })}
            disabled={isLoading || !swingSDK?.isReady}
            onClick={connectWallet}
          >
            Connect Wallet
          </Button>
        )}
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
