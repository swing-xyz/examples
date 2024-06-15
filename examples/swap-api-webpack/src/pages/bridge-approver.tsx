import { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import { ethers } from "ethers";
import { sendTransaction } from "../utils";
import { BigNumber } from "@ethersproject/bignumber";

export interface ChainInfo {
  slug: string;
  chainId: number;
  name: string;
  tokens: TokenInfo[];
}

export interface BridgeInfo {
  name: string;
  slug: string;
}

export interface TokenInfo {
  name: string;
  decimals: number;
  symbol: string;
  address: string;
}

//  The list of tokens to be supported by Swing approve builder
const majorTokens = [
  "USDC",
  "USDT",
  "DAI",
  "BUSD",
  "USDC.e",
  "axlUSDC",
  "axlWETH",
  "axlDAI",
  "axlUSDT",
  "axlWBNB",
  "USDC.e",
  "USDT.e",
  "fUSDC",
  "fUSDT",
  "1INCH",
  "AAVE",
  "UNI",
];

export const MAX_APPROVAL_AMOUNT = ethers.constants.MaxUint256;
export const baseURL = "http://localhost:3000";

const BridgerApprover: React.FC = () => {
  const [chains, setChains] = useState<ChainInfo[]>([]);
  const [bridges, setBridges] = useState<BridgeInfo[]>([]);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);

  const [currentChain, setCurrentChain] = useState("");
  const [currentToken, setCurrentToken] = useState("");
  const [currentTokenAddress, setCurrentTokenAddress] = useState("");
  const [currentBridge, setCurrentBridge] = useState("");
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [allowanceLoading, setAllowanceLoading] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState(0);

  const { account, chainId, connect } = useAuth();

  useEffect(() => {
    async function getConfig() {
      const { data } = await axios.get(
        `${baseURL}/v0/transfer/config?projectId=app-swing-xyz`
      );

      const chainLists: ChainInfo[] = [];
      const bridgeLists: BridgeInfo[] = [];

      const { chains, bridges: sBridges } = data;

      chains.forEach((chain: any) => {
        const cTokens: TokenInfo[] = [];
        const chainTokens = chain.tokens;
        chainTokens.forEach((token: any) => {
          cTokens.push({
            name: token.name,
            symbol: token.symbol,
            address: token.address,
            decimals: token.decimals,
          });
        });

        let tokenFiltered = cTokens.filter((token: any) => {
          return majorTokens.includes(token.symbol);
        });
        tokenFiltered = tokenFiltered.filter((value, index) => {
          return (
            index ===
            tokenFiltered.findIndex((obj) => {
              return JSON.stringify(obj) === JSON.stringify(value);
            })
          );
        });

        if (chain.protocolType === "evm") {
          chainLists.push({
            slug: chain.slug,
            chainId: chain.chainId,
            name: chain.name,
            tokens: Array.from(new Set(tokenFiltered)),
          });
        }
      });

      sBridges.forEach((bridge: any) => {
        bridgeLists.push({
          slug: bridge.slug,
          name: bridge.name,
        });
      });

      setChains(chainLists);
      setBridges(bridgeLists);
      setTokens(chainLists[0].tokens);

      setCurrentChain(chainLists[0].slug);
      setCurrentToken(chainLists[0].tokens[0].symbol);
      setCurrentTokenAddress(chainLists[0].tokens[0].address);
      setCurrentBridge(bridgeLists[0].slug);
    }

    getConfig();
  }, []);

  useEffect(() => {
    const currentChainInfo = chains.find(
      (chain) => chain.slug === currentChain
    );

    if (!currentTokenAddress || !account) {
      return;
    }

    let url = `${baseURL}/v0/transfer/allowance?tokenSymbol=${currentToken}&fromChain=${currentChainInfo?.slug}&fromAddress=${account}&bridge=${currentBridge}&tokenAddress=${currentTokenAddress}&fromChainId=${currentChainInfo?.chainId}`;
    if (currentBridge === "multiversx") {
      url = `${url}&toChain=msx&toChainId=0`;
    }

    try {
      // declare the async data fetching function
      const fetchData = async () => {
        setLoading(true);
        setAllowanceLoading(true);
        const { data } = await axios.get(url);
        setApprovedAmount(data.allowance);
        setLoading(false);
        setAllowanceLoading(false);
      };

      setError("");
      fetchData().catch((e) => {
        setLoading(false);
        setAllowanceLoading(false);
        setApprovedAmount(0);
      });
    } catch (e) {
      setLoading(false);
      setAllowanceLoading(false);
    }
  }, [
    account,
    approvedAmount,
    chains,
    currentBridge,
    currentChain,
    currentToken,
    currentTokenAddress,
  ]);

  const handleChainChange = (event: any) => {
    const value = event.target.value;

    const chain = chains.find((chain) => chain.slug === value);
    if (!chain) {
      return;
    }

    setTokens(chain.tokens);
    setCurrentChain(chain.slug);
    if (chain.tokens?.length > 0) {
      setCurrentToken(chain.tokens[0].symbol);
      setCurrentTokenAddress(chain.tokens[0].address);
    } else {
      setCurrentToken("");
      setCurrentTokenAddress("");
    }

    setError("");
  };

  const handleTokenChange = (event: any) => {
    const value = event.target.value;
    setCurrentToken(value);
    setCurrentTokenAddress(
      tokens.filter((token) => token.symbol === value)[0].address
    );
    setError("");
  };

  const approve = async () => {
    setLoading(true);

    // do approval
    const currentChainInfo = chains.find(
      (chain) => chain.slug === currentChain
    );
    let url = `${baseURL}/v0/transfer/approve?tokenSymbol=${currentToken}&tokenAddress=${currentTokenAddress}&tokenAmount=${MAX_APPROVAL_AMOUNT}&fromChain=${currentChainInfo?.slug}&fromAddress=${account}&bridge=${currentBridge}&fromChainId=${currentChainInfo?.chainId}`;
    if (currentBridge === "multiversx") {
      url = `${url}&toChain=msx&toChainId=0`;
    }

    try {
      setError("");
      const { data } = await axios.get(url);

      // check chain id and chain connected
      console.log("chainId", chainId);
      console.log("chainId", currentChainInfo?.chainId);
      if (chainId !== currentChainInfo?.chainId) {
        setError(
          `Please connect to the correct chain ${currentChainInfo?.name}`
        );
        setLoading(false);
        return;
      }

      const hash = await sendTransaction(data);
      setTxHash(hash);

      setTimeout(() => setLoading(false), 10000);
    } catch (e) {
      console.log("Tx running error:", e);
      console.log("Tx running error:", (e as any).response?.data.message);
      setError((e as any).response?.data.message || "");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-10 text-2xl font-bold">
        <h2>Approval App Builder</h2>
      </div>
      <div className="mt-10 rounded-lg bg-white p-6 shadow-lg flex gap-4">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="relative mb-6">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="chains"
            >
              Chains:
            </label>
            <select
              id="chains"
              className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              value={currentChain}
              onChange={handleChainChange}
            >
              {chains.map((chain) => {
                return (
                  <option key={chain.slug} value={chain.slug}>
                    {chain.name}
                  </option>
                );
              })}
              ;
            </select>
          </div>

          <div className="relative mb-6">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Tokens:
            </label>
            <select
              className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              value={currentToken}
              onChange={handleTokenChange}
            >
              {tokens.map((token) => {
                return (
                  <option
                    key={token.address + token.symbol}
                    value={token.symbol}
                  >
                    {token.symbol}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="relative mb-6">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Bridges:
            </label>
            <select
              className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              value={currentBridge}
              onChange={(e) => {
                setCurrentBridge(e.target.value);
                setError("");
              }}
            >
              {bridges.map((bridge) => {
                return (
                  <option key={bridge.slug} value={bridge.slug}>
                    {bridge.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="relative mb-6">
            <p className="text-gray-600 text-xs">
              Major tokens: {majorTokens.join(", ")}
            </p>
            <p className="mt-1 text-gray-600 text-xs italic">
              All token in the list has been filed following the major tokens
            </p>

            {account && (
              <p className="flex flex-col mt-3 text-gray-600 text-xs">
                <span>ChainId: {chainId}</span>
                <span>fromUserAddress: {account}</span>
                <span>tokenAddress: {currentTokenAddress}</span>
                <span>Approved amount: {approvedAmount}</span>
                <span>bridge: {currentBridge}</span>
                <span>txHash: {txHash}</span>
              </p>
            )}

            {error.length > 0 && (
              <p className="flex flex-col mt-3 text-red-600 text-xs">
                <span> {error}</span>
              </p>
            )}
          </div>

          <div className="relative">
            <button
              className="inline-flex items-center px-6 py-4  text-sm font-semibold leading-6 text-white transition duration-150 ease-in-out bg-orange-500 rounded-md shadow cursor-pointer hover:bg-orange-400 disabled:opacity-50"
              onClick={() => (!account ? connect() : approve())}
              disabled={
                !account
                  ? false
                  : BigNumber.from(approvedAmount).gte(
                      BigNumber.from(MAX_APPROVAL_AMOUNT)
                    )
                  ? true
                  : false
              }
            >
              {loading && (
                <svg
                  className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}

              {!account
                ? "Connect Metamask"
                : allowanceLoading
                ? "Load allowance..."
                : BigNumber.from(approvedAmount).gte(
                    BigNumber.from(MAX_APPROVAL_AMOUNT)
                  )
                ? "Already Approved"
                : "Approve Now"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default BridgerApprover;
