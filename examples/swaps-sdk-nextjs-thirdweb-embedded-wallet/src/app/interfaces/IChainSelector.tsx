import { Chain, Token } from '@swing.xyz/sdk';
import { ReactNode } from 'react';

export interface ISelectChain {
    title?: string;
    chains: Chain[];
    onChainAndTokenSelected: (selectedChain: ISelectedChain) => void;
    toChain?: Chain | null;
}

export interface ISelectedChain {
    chain?: Chain | null;
    token?: Token | null;
}

export interface ISelectChainContext {
    selectedChain?: ISelectedChain;
    setChainAndToken: (chain: ISelectedChain) => void;
    clearChainAndToken: () => void;
}

export interface ISelectChainProvider {
    children: ReactNode;
}
