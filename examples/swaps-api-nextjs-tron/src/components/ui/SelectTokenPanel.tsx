import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Token } from "interfaces/token.interface";
import { ChainTokenItem } from "./ChainTokenItem";

const allowedTokens = [
  "MATIC",
  "USDC",
  "USDT",
  "ARB",
  "ETH",
  "AVAX",
  "POL",
  "TRX",
];

export const SelectTokenPanel = ({
  tokens,
  transferParams,
  onTokenSelect,
}: {
  tokens: Token[];
  transferParams: {
    tokenIconUrl: string;
    chain: string | undefined;
    token: string | undefined;
  };
  onTokenSelect?: (token: Token) => void;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [filteredTokens, setFilteredTokens] = useState<Token[]>(tokens);

  useEffect(() => {
    if (isOpen) {
      setFilteredTokens(tokens);
    }
  }, [isOpen]);

  return (
    <Popover defaultOpen={false} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className="flex items-center justify-center rounded-2xl">
        <span>{transferParams.token}</span>
      </PopoverTrigger>
      <PopoverContent className="flex max-h-96 min-w-[50px] flex-col gap-y-2 overflow-scroll rounded-2xl">
        <input
          id="width"
          defaultValue=""
          placeholder={"Search Token (e.g. USDC)"}
          className="col-span-2 h-8 w-full rounded-xl border-none focus:border-2 focus:border-purple-300"
          onChange={(e) => {
            const tokenResults = tokens?.filter((token) =>
              token.symbol
                .toLowerCase()
                .startsWith(e.target.value.toLowerCase()),
            );
            setFilteredTokens(() => [...tokenResults!]);
          }}
        />
        {filteredTokens?.map(
          (token, index) =>
            allowedTokens.includes(token.symbol) && (
              <ChainTokenItem
                logo={token.logo}
                name={token.symbol}
                key={index}
                onItemSelect={() => {
                  onTokenSelect?.(token);
                  setIsOpen(false);
                }}
              />
            ),
        )}
      </PopoverContent>
    </Popover>
  );
};
