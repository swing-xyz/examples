import { Chain } from '@swing.xyz/sdk';
import { ISelectedChain } from 'app/interfaces/IChainSelector';
import { FC } from 'react';

export const SingleChain: FC<IChain> = ({ chain, onSelectChain }) => {
    return (
        <div
            key={chain.id}
            className="mt-1 group hover:bg-slate-200 hover:rounded-md hover:cursor-pointer grayscale hover:grayscale-0 transition-all"
            onClick={() => onSelectChain({ chain, token: null })}
        >
            <div className="group inline-flex justify-start items-center space-x-2 p-3">
                <img src={chain.logo} alt={chain.name} className="rounded-full w-8 h-8" />
                <h2>{chain.name}</h2>
            </div>
        </div>
    );
};

export interface IChain {
    chain: Chain;
    onSelectChain: (selectedChain: ISelectedChain) => void;
}
