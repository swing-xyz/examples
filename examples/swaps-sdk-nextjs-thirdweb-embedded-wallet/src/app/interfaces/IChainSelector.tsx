<<<<<<< HEAD
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
=======
import { Chain, Token } from "@swing.xyz/sdk";
import { ReactNode } from "react";

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
>>>>>>> 17ed0bedd0282c70968c091fdded49e7dbedd508
}
