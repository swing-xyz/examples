import SwingSDK, { Chain, Token } from '@swing.xyz/sdk';
import { FC, useEffect, useState } from 'react';
import { useCustomSwingSdk } from 'components/hooks/useSwingSDK';
import { ISelectedChain } from 'app/interfaces/IChainSelector';

export const SingleToken: FC<IToken> = ({ chain, token, onSelectChain }) => {
    const { swingSDK, isConnected, walletAddress } = useCustomSwingSdk();
    const [tokenBalance, setTokenBalance] = useState('');

    useEffect(() => {
        if (!swingSDK.isReady || !isConnected) {
            return;
        }

        // swingSDK.wallet.getBalance(chain.slug, token.symbol, walletAddress).then((balance) => {
        //     console.log(balance);
        //     setTokenBalance(balance);
        // });
    }, [swingSDK.isReady]);

    return (
        <div
            key={token.symbol}
            className="w-full mt-1 group hover:bg-slate-200 hover:rounded-md hover:cursor-pointer grayscale hover:grayscale-0 transition-all"
            onClick={() => onSelectChain({ chain, token })}
        >
            <div className="group flex justify-between items-center p-3">
                <div className="flex justify-start items-center space-x-2">
                    <img src={token.logo} alt={token.symbol} className="rounded-full w-8 h-8" />
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
