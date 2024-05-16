export interface TokenQueryParams {
  chain: string;
}

export interface Token {
  symbol: string;
  address: string;
  logo: string;
  decimals: number;
  chain: string;
}

export interface TokenAPIResponse extends Array<Token> {}
