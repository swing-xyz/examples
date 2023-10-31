"use client";

import SwingSDK, {
  Contract,
  TransferParams,
  TransferQuote,
  TransferRoute,
  TransferStepResult,
  TransferStepResults,
} from "@swing.xyz/sdk";
import "@swing.xyz/ui/theme.css";
import { Button } from "components/ui/button";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const swingSDK = new SwingSDK({
  projectId: "example-staking-sdk-nextjs",
});

export function Stake() {
  const metamask =
    typeof window !== "undefined" ? (window.ethereum as any) : undefined;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<TransferStepResult | null>(null);
  const [results, setResults] = useState<TransferStepResults | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [quote, setQuote] = useState<TransferQuote | null>(null);
  const [transferParams, setTransferParams] = useState<TransferParams | null>(
    null
  );

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

      const address = await swingSDK.wallet.connect(metamask, "ethereum");

      setWalletAddress(address);

      return address;
    } catch (error) {
      setError("Metamask not connected. Do you have it installed?");
    }
  }

  async function startTransfer(
    transferRoute: TransferRoute,
    transferParams: TransferParams
  ) {
    if (!transferRoute) {
      setError("Choose a transfer route first.");
      return;
    }

    setIsLoading(true);

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

    try {
      await swingSDK.transfer(transferRoute, transferParams);
    } catch (error: any) {
      setError(error.message);
    }

    setIsLoading(false);
  }

  return (
    <div className="container grid gap-4 px-20">
      <div className="grid grid-cols-4">
        <div>Provider</div>
        <div>Send</div>
        <div>Receive</div>
        <div></div>
      </div>

      {swingSDK.contracts.map((contract) => {
        return (
          <div key={contract.id} className="grid grid-cols-4">
            <NameLogo
              name={contract.integration.name}
              logo={contract.integration.logo}
            />
            <NameLogo
              name={contract.inputToken.symbol!}
              logo={contract.inputToken?.logo}
            />
            <NameLogo
              name={contract.outputToken?.symbol!}
              logo={contract.outputToken?.logo}
            />

            <Button
              className="w-40"
              variant="secondary"
              disabled={isLoading}
              onClick={async () => {
                const fromUserAddress = await connectWallet();
                if (!fromUserAddress) return;

                setIsLoading(true);

                const params = {
                  amount: "1",
                  fromChain: contract.chain,
                  fromToken: contract.inputToken.symbol,
                  fromUserAddress,
                  toChain: contract.chain,
                  toToken: contract.outputToken?.symbol!,
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
          </div>
        );
      })}

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
              <DialogTitle className="flex items-center gap-4 mb-8">
                <NameLogo
                  name={transferParams.fromToken!}
                  logo={
                    swingSDK.getTokenForChain(
                      transferParams?.fromChain,
                      transferParams?.fromToken
                    )?.logo
                  }
                />

                <div>to</div>

                <NameLogo
                  name={transferParams.toToken!}
                  logo={
                    swingSDK.getTokenForChain(
                      transferParams?.toChain,
                      transferParams?.toToken
                    )?.logo
                  }
                />
              </DialogTitle>
            ) : null}
          </DialogHeader>

          {quote?.routes.length ? (
            <div className="grid gap-4">
              <div className="grid grid-cols-5">
                <div>Provider</div>
                <div>Fees</div>
                <div>Gas</div>
                <div>Total</div>
                <div></div>
              </div>

              {quote?.routes.map((route, index) => {
                const integration = swingSDK.getIntegration(
                  route.quote.integration
                );

                return (
                  <div key={index} className="grid items-center grid-cols-5">
                    <NameLogo
                      name={integration?.name!}
                      logo={integration?.logo}
                    />

                    <div>${route.quote.bridgeFeeUSD}</div>
                    <div>${route.gasUSD}</div>
                    <div>${route.quote.amountUSD}</div>

                    <Button
                      className="w-40"
                      variant="secondary"
                      disabled={isLoading}
                      onClick={() =>
                        startTransfer(route, {
                          amount: "1",
                          fromChain: quote.fromChain.slug,
                          fromToken: quote.fromToken.symbol,
                          toChain: quote.toChain.slug,
                          toToken: quote.toToken.symbol,
                          fromUserAddress: walletAddress!,
                          toUserAddress: walletAddress!,
                        })
                      }
                    >
                      Stake
                    </Button>
                  </div>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NameLogo({ logo, name }: { logo?: string; name: string }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-5 h-5">
        <AvatarImage src={logo} alt={name} />
        <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
      </Avatar>
      <div>{name}</div>
    </div>
  );
}
