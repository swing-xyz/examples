import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ChainTokenItem } from "./ChainTokenItem";
import { Chain } from "interfaces/chain.interface";
import clsx from "clsx";

const allowedChains = [
  "ethereum",
  "polygon",
  "avalanche",
  "arbitrum",
  "sepolia",
];

export const SelectChainPanel = ({
  chains,
  transferParams,
  onChainSelect,
  className,
}: {
  chains: Chain[];
  transferParams: { chainIconUrl: string; chain: string | undefined };
  onChainSelect?: (chain: Chain) => void;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Popover defaultOpen={false} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className={clsx(
          "flex items-center justify-center rounded-2xl",
          className,
        )}
      >
        <img src={transferParams.chainIconUrl} className="w-10 rounded-full" />
      </PopoverTrigger>
      <PopoverContent className="max-h-96 min-w-[50px] overflow-scroll rounded-2xl">
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
