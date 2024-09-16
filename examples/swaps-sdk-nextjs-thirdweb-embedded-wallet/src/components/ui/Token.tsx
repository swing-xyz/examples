import { Chain, Token } from '@swing.xyz/sdk';
import { FC, useEffect, useState } from 'react';
import { useCustomSwingSdk } from 'components/hooks/useSwingSDK';
import { ISelectedChain } from 'app/interfaces/IChainSelector';

export const SingleToken: FC<IToken> = ({ chain, token, onSelectChain }) => {
  const { swingSDK, isConnected } = useCustomSwingSdk();
  const [tokenBalance] = useState('');

  useEffect(() => {
    if (!swingSDK?.isReady || !isConnected) {
      return;
    }

    // swingSDK.wallet.getBalance(chain.slug, token.symbol, walletAddress).then((balance) => {
    //     console.log(balance);
    //     setTokenBalance(balance);
    // });
  }, [swingSDK?.isReady, isConnected]);

  return (
    <div
      key={token.symbol}
      className="group mt-1 w-full grayscale transition-all hover:cursor-pointer hover:rounded-md hover:bg-slate-200 hover:grayscale-0"
      onClick={() => onSelectChain({ chain, token })}
    >
      <div className="group flex items-center justify-between p-3">
        <div className="flex items-center justify-start space-x-2">
          <img
            src={token.logo}
            alt={token.symbol}
            className="h-8 w-8 rounded-full"
          />
          <h2>{token.symbol}</h2>
        </div>
        <h2>{Number(tokenBalance).toFixed(3)}</h2>
      </div>
    </div>
  );
};

export interface IToken {
  token: Token;
  chain: Chain;
  onSelectChain: (selectedChain: ISelectedChain) => void;
}
