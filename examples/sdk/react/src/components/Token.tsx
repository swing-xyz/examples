export type TokenType = {
  address?: string;
  symbol?: string;
  decimal?: number;
}

type Token = {
  data?: TokenType[];
  value?: TokenType;
  onChange?: (e: any) => void;
};

const TokenContainer: React.FC<Token> = ({ data = [], value, onChange }) => {
  const renderTokens = () => data.map((token, idx) => <option key={idx} value={token.address}>{token.symbol}</option>);

  return (
    <select className="border rounded-xl p-2" onChange={onChange} defaultValue={value?.address} value={value?.address}>
      {renderTokens()}
    </select>
  );
};

export default TokenContainer;