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
};
