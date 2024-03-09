<<<<<<< HEAD
import { TransferParams } from '@swing.xyz/sdk';
import { FC } from 'react';
import { SelectChain } from '../SelectChain';
import { ISelectChain } from 'app/interfaces/IChainSelector';
import { IModalContext } from 'app/interfaces/IModal';

export const openSelectChainModal = ({ openModal }: IModalContext, { title, chains, toChain, onChainAndTokenSelected }: ISelectChain) => {
    openModal({
        content: <SelectChain chains={chains} toChain={toChain} onChainAndTokenSelected={onChainAndTokenSelected} />,
        title: title ?? '',
    });
=======
import { SelectChain } from "../SelectChain";
import { ISelectChain } from "app/interfaces/IChainSelector";
import { IModalContext } from "app/interfaces/IModal";

export const openSelectChainModal = (
  { openModal }: IModalContext,
  { title, chains, toChain, onChainAndTokenSelected }: ISelectChain,
) => {
  openModal({
    content: (
      <SelectChain
        chains={chains}
        toChain={toChain}
        onChainAndTokenSelected={onChainAndTokenSelected}
      />
    ),
    title: title ?? "",
  });
>>>>>>> 17ed0bedd0282c70968c091fdded49e7dbedd508
};
