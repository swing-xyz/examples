import { Chain, Token } from '@swing.xyz/sdk';
import { ReactNode } from 'react';

export interface ISelectChain {
  title?: string;
  chains: Chain[];
  // eslint-disable-next-line no-unused-vars
  onChainAndTokenSelected: (selectedChain: ISelectedChain) => void;
  toChain?: Chain | null;
}

export interface ISelectedChain {
  chain?: Chain | null;
  token?: Token | null;
}

export interface ISelectChainContext {
  selectedChain?: ISelectedChain;
  // eslint-disable-next-line no-unused-vars
  setChainAndToken: (chain: ISelectedChain) => void;
  clearChainAndToken: () => void;
}

export interface ISelectChainProvider {
  children: ReactNode;
}
