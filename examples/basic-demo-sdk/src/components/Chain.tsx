import { TokenType } from "./Token";

export type ChainType = {
  chainId: number;
  name?: string;
  slug?: string;
  tokens?: TokenType[];
}

type Chain = {
  data?: ChainType[];
  value?: ChainType;
  onChange?: (e: any) => void;
};

const ChainContainer: React.FC<Chain> = ({ data = [], value, onChange = () => {} }) => {
  const renderChains = () => data.map((chain, idx) => <option key={idx} value={chain.chainId}>{chain.name}</option>);

  return (
    <select className="border rounded-xl p-2" onChange={onChange} defaultValue={value?.chainId} value={value?.chainId}>
      {renderChains()}
    </select>
  );
};

export default ChainContainer;