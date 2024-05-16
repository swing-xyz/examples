import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ChainTokenItem } from "./ChainTokenItem";
import { Chain } from "interfaces/chain.interface";

const allowedChains = ["ethereum", "polygon", "avalanche"];

export const SelectChainPanel = ({
  chains,
  transferParams,
  onChainSelect,
}: {
  chains: Chain[];
  transferParams: { chainIconUrl: string; chain: string | undefined };
  onChainSelect?: (chain: Chain) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover defaultOpen={false} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className="justify-center rounded-2xl flex items-center bg-zinc-600">
        <img src={transferParams.chainIconUrl} className="w-7 rounded-full" />
      </PopoverTrigger>
      <PopoverContent className="rounded-2xl min-w-[50px] max-h-96 overflow-scroll">
        {chains.map(
          (chain) =>
            allowedChains.includes(chain.slug) && (
              <ChainTokenItem
                logo={chain.logo}
                name={chain.name}
                key={chain.slug}
                onItemSelect={() => {
                  onChainSelect?.(chain);
                  setIsOpen(false);
                }}
              />
            ),
        )}
      </PopoverContent>
    </Popover>
  );
};
