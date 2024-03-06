import { useToast } from "@/ui/use-toast";
import { ToastAction } from "@radix-ui/react-toast";
import SwingSDK, { TransferParams } from "@swing.xyz/sdk";
import {
  EmbeddedWallet,
  useEmbeddedWallet,
  useSigner,
  useWallet,
} from "@thirdweb-dev/react";
import React, { useContext, type SetStateAction, type Dispatch } from "react";

const CustomSwingSdkContext = React.createContext<ISwingSdkContext | null>(
  null
);

const allowedChains = [
  "ethereum",
  "polygon",
  "axelar",
  "osmosis-1",
  "optimism",
  "avalanche",
  "aurora",
  "solana",
  "celo",
  "arbitrum",
];
const allowedTokens = ["USDC", "USDT", "MATIC", "OSMA", "AXL", "SOL"];

const defaultTransferParams: TransferParams = {
  amount: "0",
  fromChain: "polygon",
  fromToken: "MATIC",
  fromUserAddress: "",
  toChain: "polygon",
  toToken: "USDT",
  toUserAddress: "",
};

export const CustomSwingSdkProvider: React.FC<ISwingSdkProvider> = ({
  children,
}) => {
  const { connect } = useEmbeddedWallet();
  const signer = useSigner();
  const embeddedWallet = useWallet("embeddedWallet");

  const [walletAddress, setWalletAddress] = React.useState<string>("");
  const [swingSDK, setSwingSDK] = React.useState<SwingSDK | null>(null);
  const isConnected = swingSDK?.wallet.isConnected();
  const [balance, setBalance] = React.useState<string>("");
  const [error, setError] = React.useState("");
  const [transferParams, setTransferParams] = React.useState<TransferParams>(
    defaultTransferParams
  );

  const { toast } = useToast();

  async function connectWallet() {
    if (!swingSDK) return;

    try {
      await connect({
        strategy: "iframe",
      });

      const walletAddress = await swingSDK.wallet.connect(
        signer,
        defaultTransferParams.fromChain
      );

      const balance = await swingSDK.wallet.getBalance(
        defaultTransferParams.fromChain,
        defaultTransferParams.fromToken,
        walletAddress
      );
      setBalance(balance);

      setWalletAddress(walletAddress);

      setTransferParams((prev: TransferParams) => {
        return {
          ...prev,
          fromUserAddress: walletAddress,
          toUserAddress: walletAddress,
          amount: "1",
        };
      });
    } catch (error) {
      console.error("Connect Wallet Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: (error as Error).message,
        action: (
          <ToastAction altText="Try again" onClick={connectWallet}>
            Try again
          </ToastAction>
        ),
      });
      setError((error as Error).message);
    }
  }

  const provider = {
    isConnected,
    walletAddress,
    setWalletAddress,
    connect,
    signer,
    embeddedWallet,
    swingSDK,
    setSwingSDK,
    balance,
    allowedChains,
    allowedTokens,
    setBalance,
    error,
    setError,
    defaultTransferParams,
    connectWallet,
    transferParams,
    setTransferParams,
  };

  return (
    <CustomSwingSdkContext.Provider value={provider}>
      {children}
    </CustomSwingSdkContext.Provider>
  );
};

export interface ISwingSdkProvider {
  children: React.ReactNode;
}

export interface ISwingSdkContext {
  swingSDK: SwingSDK | null;
  walletAddress: string;
  setWalletAddress: (wallet: string) => void;
  setSwingSDK: (swingSDK: SwingSDK) => void;
  setBalance: (balance: string) => void;
  balance: string;
  isConnected?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signer: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connect: (authParams: any) => Promise<EmbeddedWallet>;
  embeddedWallet: EmbeddedWallet | undefined;
  allowedChains: string[];
  allowedTokens: string[];
  defaultTransferParams: TransferParams;
  error: string;
  setError: (error: string) => void;
  connectWallet: () => void;
  transferParams: TransferParams;
  setTransferParams: Dispatch<SetStateAction<TransferParams>>;
}

export const useCustomSwingSdk = () => {
  const contextValue = useContext(CustomSwingSdkContext);
  if (contextValue === null) {
    throw new Error(
      "useCustomSwingSdk must be used within a CustomSwingSdkProvider"
    );
  }
  return contextValue;
};
