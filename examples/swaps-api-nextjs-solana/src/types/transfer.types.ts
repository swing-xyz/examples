import { QuoteQueryParams } from "interfaces/quote.interface";

interface ChainDecimals {
  fromChainDecimal?: number;
  toChainDecimal?: number;
}

interface ChainIcons {
  fromChainIconUrl?: string;
  toChainIconUrl?: string;
  fromTokenIconUrl?: string;
  toTokenIconUrl?: string;
}

interface NativeSourceToken {
  fromNativeTokenSymbol?: string;
  toNativeTokenSymbol?: string;
}

interface ChainIds {
  fromChainId?: string;
  toChainId?: string;
}

export type TransferParams = QuoteQueryParams &
  ChainDecimals &
  ChainIcons &
  NativeSourceToken &
  ChainIds;
