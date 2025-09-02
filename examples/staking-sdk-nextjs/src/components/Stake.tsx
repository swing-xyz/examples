"use client";

import {
  TransferParams,
  TransferQuote,
  TransferRoute,
  TransferStepResult,
  TransferStepResults,
} from "@swing.xyz/sdk";
import { Button } from "components/ui/button";
import { Fragment, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAccount, useSwitchChain } from "wagmi";
import { useSwingSdk } from "./SwingSdkProvider";
import { useConnectWallet } from "hooks/useConnectWallet";

export function Stake() {
  const [swingSDK, { isReady }] = useSwingSdk();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<TransferStepResult | null>(null);
  const [results, setResults] = useState<TransferStepResults | null>(null);
  const [quote, setQuote] = useState<TransferQuote | null>(null);
  const [transferParams, setTransferParams] = useState<TransferParams | null>(
    null,
  );
  const { address, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const connectWallet = useConnectWallet();

  async function startTransfer(
    transferRoute: TransferRoute,
    transferParams: TransferParams,
  ) {
    if (!transferRoute) {
      setError("Choose a transfer route first.");
      return;
    }

    setError("");
    setIsLoading(true);

    // Setup a transfer listener to handle user required interactions
    const removeTransferListener = swingSDK.on(
      "TRANSFER",
      async (transferStep, transferResults) => {
        setStatus(transferStep);
        setResults(transferResults);

        console.log("TRANSFER", {
          transferId: transferResults.transferId,
          transferStep,
          transferResults,
        });

        switch (transferStep.status) {
          case "WALLET_CONNECTION_REQUIRED":
            try {
              await connectWallet(transferStep.chain);
            } catch (error) {
              // Cancel transfer if user rejects wallet connection
              swingSDK.cancelTransfer(transferResults.transferId);
            }
            break;

          case "CHAIN_SWITCH_REQUIRED":
            try {
              await switchChainAsync?.({ chainId: transferStep.chain.chainId });
            } catch (error) {
              // Cancel transfer if user rejects network switch
              swingSDK.cancelTransfer(transferResults.transferId);
            }
            break;
        }
      },
    );

    try {
      await swingSDK.transfer(transferRoute, transferParams);
    } catch (error) {
      // This will be the same error that's available in `transferStep.error` when the transferStep is `FAILED`
      setError((error as Error).message);
    }

    // Remove event listener
    removeTransferListener();

    setIsLoading(false);
  }

  return (
    <div className="container grid gap-4 pb-20 pt-5">
      <div className="grid grid-cols-5">
        <div>Provider</div>
        <div>Chain</div>
        <div>Send</div>
        <div>Receive</div>
        <div></div>
      </div>

      {isReady
        ? swingSDK.getAvailableStakingTokens().map((contract) => {
            return (
              <div key={contract.id} className="grid grid-cols-5">
                <NameLogo
                  name={contract.integration.name}
                  logo={contract.integration.logo}
                />
                <NameLogo
                  name={contract.chain.name}
                  logo={contract.chain.logo}
                />
                <NameLogo
                  name={contract.inputToken.symbol}
                  logo={contract.inputToken.logo}
                />
                <NameLogo
                  name={contract.outputToken.symbol}
                  logo={contract.outputToken.logo}
                />

                <Button
                  className="w-40"
                  variant="secondary"
                  disabled={isLoading}
                  onClick={async () => {
                    const fromUserAddress = await connectWallet(contract.chain);
                    if (!fromUserAddress) return;

                    setIsLoading(true);

                    const params = {
                      amount: "1",
                      fromChain: contract.chain.slug,
                      fromToken: contract.inputToken.symbol,
                      fromUserAddress,
                      toChain: contract.chain.slug,
                      toToken: contract.outputToken?.symbol,
                      toUserAddress: fromUserAddress,
                    };
                    setTransferParams(params);

                    const quoteResponse = await swingSDK.getQuote(params);

                    setQuote(quoteResponse);
                    setIsLoading(false);
                  }}
                >
                  Stake Now
                </Button>
                <Button
                  className="w-40"
                  variant="outline"
                  disabled={isLoading}
                  onClick={async () => {
                    const fromUserAddress = await connectWallet(contract.chain);
                    if (!fromUserAddress) return;

                    setIsLoading(true);

                    const params = {
                      amount: "1",
                      fromChain: contract.chain.slug,
                      fromToken: contract.inputToken.symbol,
                      fromUserAddress,
                      toChain: contract.chain.slug,
                      toToken: contract.outputToken?.symbol,
                      toUserAddress: fromUserAddress,
                      type: "withdraw",
                    };
                    setTransferParams(params);

                    const quoteResponse = await swingSDK.getQuote(params);

                    setQuote(quoteResponse);
                    setIsLoading(false);
                  }}
                >
                  Withdraw
                </Button>
              </div>
            );
          })
        : null}

      <Dialog
        open={!!transferParams}
        onOpenChange={() => {
          setTransferParams(null);
          setQuote(null);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            {transferParams ? (
              <DialogTitle className="mb-8 flex items-center gap-4">
                <div>Stake</div>

                <NameLogo
                  name={transferParams.fromToken!}
                  logo={
                    swingSDK.getTokenForChain(
                      transferParams?.fromChain,
                      transferParams?.fromToken,
                    )?.logo
                  }
                />

                <div>for</div>

                <NameLogo
                  name={transferParams.toToken!}
                  logo={
                    swingSDK.getTokenForChain(
                      transferParams?.toChain,
                      transferParams?.toToken,
                    )?.logo
                  }
                />
              </DialogTitle>
            ) : null}
          </DialogHeader>

          {quote?.routes.length ? (
            <div className="grid grid-cols-[minmax(50px,_100px)_2fr_3fr_3fr_160px] items-center gap-4">
              <div>Provider</div>
              <div>Fees</div>
              <div>Gas</div>
              <div>Total</div>
              <div></div>

              {quote?.routes.map((route, index) => {
                const integration = swingSDK.getIntegration(
                  route.quote.integration,
                );

                return (
                  <Fragment key={index}>
                    <NameLogo
                      name={integration?.name || ""}
                      logo={integration?.logo}
                    />

                    <div>${route.quote.bridgeFeeUSD}</div>
                    <div className="truncate">${route.gasUSD}</div>
                    <div>${route.quote.amountUSD}</div>

                    <Button
                      className="w-40"
                      variant="secondary"
                      disabled={isLoading}
                      onClick={async () => {
                        let fromUserAddress = address;
                        if (!isConnected) {
                          const chain = swingSDK.getChain(quote.fromChain.slug);
                          fromUserAddress = await connectWallet(chain!);
                        }

                        await startTransfer(route, {
                          amount: "1",
                          fromChain: quote.fromChain.slug,
                          fromToken: quote.fromToken.symbol,
                          toChain: quote.toChain.slug,
                          toToken: quote.toToken.symbol,
                          fromUserAddress: fromUserAddress!,
                          toUserAddress: fromUserAddress!,
                        });
                      }}
                    >
                      Stake
                    </Button>
                  </Fragment>
                );
              })}
            </div>
          ) : (
            <div>
              {isLoading
                ? "Searching for the best route..."
                : "No Routes Available"}
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

            {error ? (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">
                  Error
                </label>{" "}
                <div className="capitalize text-red-500">{error}</div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NameLogo({ logo, name }: { logo?: string; name: string }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-5 w-5">
        <AvatarImage src={logo} alt={name} />
        <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div>{name}</div>
    </div>
  );
}
