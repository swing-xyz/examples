import { Chain } from "@swing.xyz/sdk";
import { ISelectedChain } from "app/interfaces/IChainSelector";
import { FC } from "react";

export const SingleChain: FC<IChain> = ({ chain, onSelectChain }) => {
  return (
    <div
      key={chain.id}
      className="group mt-1 grayscale transition-all hover:cursor-pointer hover:rounded-md hover:bg-slate-200 hover:grayscale-0"
      onClick={() => onSelectChain({ chain, token: null })}
    >
      <div className="group inline-flex items-center justify-start space-x-2 p-3">
        <img
          src={chain.logo}
          alt={chain.name}
          className="h-8 w-8 rounded-full"
        />
        <h2>{chain.name}</h2>
      </div>
    </div>
  );
};

export interface IChain {
  chain: Chain;
  onSelectChain: (selectedChain: ISelectedChain) => void;
}
