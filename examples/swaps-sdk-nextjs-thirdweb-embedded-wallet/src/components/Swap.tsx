'use client';

import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SwingSDK, {
  TransferStepResults,
  TransferStepResult,
  TransferRoute,
  TransferParams,
  Chain,
  Token,
  type TransferQuote,
} from '@swing.xyz/sdk';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { shortenAddress } from '@thirdweb-dev/react';
import { useCustomSwingSdk } from './hooks/useSwingSDK';
import { useModal } from './hooks/useModal';
import {
  MdCheckCircle,
  MdLocalGasStation,
  MdOutlineArrowDropDown,
  MdOutlineArrowForward,
  MdOutlineTimelapse,
  MdOutlineTransform,
} from 'react-icons/md';

import { LiaExchangeAltSolid } from 'react-icons/lia';
import { useDebouncedCallback } from 'use-debounce';
import { openSelectChainModal } from './ui/modals/SelectChainModal';
import { openSelectRouteModal } from './ui/modals/SelectRouteModal';
import { useToast } from '@/ui/use-toast';
import { ToastAction } from '@radix-ui/react-toast';

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
  const [receiveAmount, setReceiveAmount] = useState('');
  const [sendChains, setSendChains] = useState<Chain[]>();
  const [receiveChains, setReceiveChains] = useState<Chain[]>();
  const [fromChain, setFromChain] = useState<Chain>();
  const [toChain, setToChain] = useState<Chain>();
  const [fromToken, setFromToken] = useState<Token>();
  const [fromTokenBalance, setFromTokenBalance] = useState('0');
  const [toToken, setToToken] = useState<Token>();
  const [toTokenBalance, setToTokenBalance] = useState('0');
  const [toTokenLocalAmount, setToTokenLocalAmount] = useState('');
  const [quotes, setQuotes] = useState<TransferQuote['routes']>([]);
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
      projectId: 'replug',
      environment: 'production',
      debug: true,
    });

    setIsLoading(true);

    swing
      .init()
      .then(async () => {
        setIsLoading(false);
        setSwingSDK(swing);

        const _sendChains = await swing.getAvailableSendChains({
          type: 'swap',
        });
        // _sendChains = _sendChains.filter((chain: Chain) => allowedChains.includes(chain.slug));

        setSendChains(_sendChains);

        const _fromChain =
          _sendChains[Math.floor(Math.random() * _sendChains.length)];

        const _sendChainTokens = await swing.getAvailableSendTokens({
          type: 'swap',
          fromChainSlug: _fromChain.slug,
        });
        console.log('send', _sendChainTokens);
        const _fromToken =
          _sendChainTokens[Math.floor(Math.random() * _sendChainTokens.length)];

        setFromToken(_fromToken);
        setFromChain(_fromChain);

        const _receiveChains = await swing.getAvailableReceiveChains({
          type: 'swap',
          fromChainSlug: _fromChain.slug,
          fromTokenSymbol: _fromToken.symbol,
        });

        // _receiveChains = _receiveChains.filter((chain: Chain) => allowedChains.includes(chain.slug));
        setReceiveChains(_receiveChains);

        const _toChain =
          _receiveChains[Math.floor(Math.random() * _receiveChains.length)];

        const _receiveChainsTokens = await swing.getAvailableReceiveTokens({
          type: 'swap',
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
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
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
      console.error('Switch Chain Error:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
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
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: 'No routes available. Try a different token pair.',
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
      console.error('Quote Error:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
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
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Choose a transfer route first.',
        action: (
          <ToastAction altText="Try again" onClick={() => openSendDialog()}>
            Choose Chain
          </ToastAction>
        ),
      });
      return;
    }

    const transferListener = swingSDK.on(
      'TRANSFER',
      async (transferStepStatus, transferResults) => {
        setStatus(transferStepStatus);
        toast({
          title: 'Swapping!',
          description: transferStepStatus.status,
          action: (
            <ToastAction altText="Try again" onClick={() => {}}>
              Cancel
            </ToastAction>
          ),
        });
        setResults(transferResults);

        console.log('TRANSFER:', transferStepStatus, transferResults);

        switch (transferStepStatus.status) {
          case 'CHAIN_SWITCH_REQUIRED':
            await switchChain(transferStepStatus.chain);
            break;

          case 'WALLET_CONNECTION_REQUIRED':
            await connectWallet();
            break;
        }
      },
    );

    setIsLoading(true);

    try {
      await swingSDK.transfer(transferRoute, transferParams);
    } catch (error) {
      console.error('Transfer Error:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
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
      title: 'Select Destination Chain',
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
      title: 'Select Source Chain',
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
            type: 'swap',
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
      className="rounded-4xl m-auto w-full max-w-4xl space-y-4 bg-white p-5 sm:w-[20rem] md:w-[20rem] lg:ml-auto lg:w-[21rem]"
    >
      <div className="flex flex-col space-y-3">
        <div className="flex w-full items-center justify-between">
          <div className="text-lg font-bold italic">PowerSwap 🔥</div>
          <div className="rounded-4xl flex min-h-5 min-w-5 bg-gray-100">
            <div className="rounded-4xl bg-black px-2 py-1.5 text-[9px] font-bold text-white">
              Swap
            </div>
            <div className=" rounded-4xl px-2 py-1.5 text-[9px] font-bold text-gray-500">
              Stake
            </div>
          </div>
        </div>

        <div className="flex w-full rounded-xl border-2 border-zinc-100">
          <div className="flex w-full items-center justify-between p-1">
            <div
              className="mr-auto flex items-center space-x-1 p-3 hover:cursor-pointer hover:rounded-lg hover:bg-zinc-300/[0.2]"
              onClick={openSendDialog}
            >
              <img
                src={fromChain?.logo}
                alt={fromChain?.name}
                className="h-7 w-7 rounded-full"
              />
              <div className="flex flex-col">
                <h5 className="text-[9px] font-bold text-gray-400">From</h5>
                <h5 className="text-[10px] font-bold capitalize">
                  {fromChain?.name}
                </h5>
              </div>
            </div>
            <div
              className="group mx-auto flex justify-center p-3 hover:cursor-pointer hover:rounded-full hover:bg-zinc-100"
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
              <LiaExchangeAltSolid className="h-5 w-5 rounded-2xl font-bold text-zinc-300 group-hover:text-zinc-600" />
            </div>
            <div
              className="ml-auto flex items-center space-x-1 p-3 hover:cursor-pointer hover:rounded-lg hover:bg-zinc-300/[0.2]"
              onClick={openReceiveDialog}
            >
              <div className="flex flex-col">
                <h5 className="text-right text-[9px] font-bold text-gray-400">
                  To
                </h5>
                <h5 className="text-[10px] font-bold capitalize">
                  {toChain?.name}
                </h5>
              </div>
              <img
                src={toChain?.logo}
                alt={toChain?.name}
                className="h-7 w-7 rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col space-y-1 rounded-xl border-2 border-zinc-100 bg-zinc-950/[0.02] p-3">
          <h4 className="w-full text-[11px] font-bold text-zinc-700">
            Deposit
          </h4>
          <div className="flex items-center justify-between">
            <input
              aria-label="deposit"
              className="m-0 h-auto w-[50%] border-none bg-transparent p-0 placeholder:m-0 placeholder:p-0 placeholder:text-lg focus:border-none focus:ring-0"
              placeholder={'0'}
              disabled={!isConnected}
              onChange={(e) => debounced(e.target.value)}
              type="number"
            />
            <div
              className="flex items-center space-x-1 rounded-xl bg-white p-2 hover:cursor-pointer"
              onClick={openSendDialog}
            >
              <img
                src={fromToken?.logo ?? ''}
                alt={fromToken?.symbol ?? defaultTransferParams.fromChain}
                className="h-4 w-4 rounded-full"
              />
              <p className="text-xs text-zinc-800">
                {fromToken?.symbol ?? <>USDC</>}
              </p>
              <MdOutlineArrowDropDown className="h-5 w-5 rounded-2xl font-bold text-zinc-300" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="m-0 p-0 text-xs text-zinc-950/[0.6]">
              {!transferRoute ? <>$0</> : <>{}</>}
            </p>
            <p className="m-0 p-0 text-[10px] text-zinc-950/[0.6]">
              {Number(fromTokenBalance).toFixed(3)}{' '}
              {fromToken?.symbol ?? <>USDC</>} available
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col space-y-2 rounded-xl border-2 border-zinc-100 bg-zinc-950/[0.02] p-3">
          <h4 className="w-full text-[11px] font-bold text-zinc-700">
            Receive
          </h4>
          <div className="flex items-center justify-between">
            <input
              aria-label="receive"
              disabled
              className="m-0 h-auto w-[50%] border-none bg-transparent p-0 placeholder:m-0 placeholder:p-0 placeholder:text-lg focus:border-none focus:ring-0"
              placeholder={'0'}
              type="number"
              value={receiveAmount}
            />
            <div
              className="flex items-center space-x-1 rounded-xl bg-white p-2 hover:cursor-pointer"
              onClick={openReceiveDialog}
            >
              <img
                src={toToken?.logo ?? ''}
                alt={toToken?.symbol ?? defaultTransferParams.fromChain}
                className="h-4 w-4 rounded-full"
              />
              <p className="text-xs text-zinc-800">
                {toToken?.symbol ?? <>USDC</>}
              </p>
              <MdOutlineArrowDropDown className="h-5 w-5 rounded-2xl font-bold text-zinc-300" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="m-0 p-0 text-xs text-zinc-950/[0.6]">
              {!transferRoute || receiveAmount === '0' ? (
                <>$0</>
              ) : (
                <>{formatUSD(toTokenLocalAmount)}</>
              )}
            </p>
            <p className="m-0 p-0 text-[10px] text-zinc-950/[0.6]">
              {Number(toTokenBalance).toFixed(3)} {toToken?.symbol ?? <>USDC</>}{' '}
              available
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col justify-between space-y-2 rounded-xl border-2 border-zinc-100">
          <div className="flex items-center justify-between border-b">
            <div className="mr-auto flex items-center gap-1 px-2 py-1">
              <MdOutlineArrowForward className="h-3 w-3" />
              <p className="text-[10px] font-bold">To address</p>
            </div>
            <div className="flex items-center space-x-1 rounded-xl bg-white p-2">
              {!isConnected ? (
                <>-</>
              ) : (
                <div className="flex space-x-1 rounded-full bg-green-200 px-2 py-1 text-[9px] font-bold text-green-600">
                  <p>{shortenAddress(walletAddress)}</p>
                  <MdCheckCircle className="h-3 w-3" />
                </div>
              )}
            </div>
          </div>
          <div className="my-0/! flex items-center justify-between border-b">
            <div className="mr-auto flex items-center gap-1 px-2 py-0">
              <MdOutlineTransform className="h-3 w-3" />
              <p className="text-[10px] font-bold">Route</p>
            </div>
            <div className="flex items-center space-x-1 rounded-xl bg-white p-2">
              {!quotes.length ? (
                <>-</>
              ) : (
                <div
                  className="flex w-full items-center space-x-1 rounded-full bg-red-200 px-2 py-1 text-[10px] font-bold text-red-600 hover:cursor-pointer"
                  onClick={() => {
                    openSelectRouteModal(modalContext, {
                      title: 'Select Route',
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
                    className="h-3 w-3 rounded-full"
                  />
                  <p className="capitalize">
                    ⚡{transferRoute?.quote?.integration}
                  </p>
                  <MdOutlineArrowDropDown className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>
          <div className="my-0/! flex items-center justify-between border-b">
            <div className="mr-auto flex items-center gap-1 px-2 py-0">
              <MdOutlineTimelapse className="h-3 w-3" />
              <p className="text-[10px] font-bold">Transfer Time</p>
            </div>
            <div className="flex items-center space-x-1 rounded-xl bg-white p-2">
              {!transferRoute ? (
                <>-</>
              ) : (
                <div className="flex space-x-1 rounded-full px-2 py-1 text-[10px] font-bold">
                  <p className="capitalize">
                    ~{transferRoute?.duration} mins 🔥
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="my-0/! flex items-center justify-between">
            <div className="mr-auto flex items-center gap-1 px-2 py-0">
              <MdLocalGasStation className="h-3 w-3 text-green-500" />
              <p className="text-[10px] font-bold">Fees</p>
            </div>
            <div className="flex items-center space-x-1 rounded-xl bg-white p-2">
              {!transferRoute ? (
                <>-</>
              ) : (
                <div className="flex space-x-1 rounded-full px-2 py-1 text-[10px] font-bold">
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
            className={clsx('mt-4 flex w-full cursor-pointer items-center', {
              'opacity-60': isLoading,
            })}
            disabled={isLoading || !(fromTokenBalance >= transferParams.amount)}
            onClick={() => (transferRoute ? startTransfer() : getQuote())}
          >
            {fromTokenBalance >= transferParams.amount
              ? 'Start transfer'
              : 'Insufficient Balance'}
            {isLoading && (
              <FontAwesomeIcon className="ml-2" icon={faCircleNotch} spin />
            )}
          </Button>
        ) : (
          <Button
            className={clsx('flex w-full cursor-pointer items-center', {
              'opacity-60': isLoading,
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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
  }).format(Number(amount));
}

export default Swap;
