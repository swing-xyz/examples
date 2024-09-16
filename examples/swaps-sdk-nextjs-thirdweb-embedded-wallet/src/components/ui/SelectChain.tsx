import { Chain, Token } from '@swing.xyz/sdk';
import { FC, useEffect, useState } from 'react';
import { SingleChain } from './Chain';
import { useSelectChain } from 'components/hooks/useSelectChain';
import { MdOutlineArrowBack } from 'react-icons/md';
import { SingleToken } from './Token';
import { useCustomSwingSdk } from 'components/hooks/useSwingSDK';
import { ISelectChain, ISelectedChain } from 'app/interfaces/IChainSelector';

export const SelectChain: FC<ISelectChain> = ({
  chains,
  onChainAndTokenSelected,
  toChain,
}) => {
  const { selectedChain, setChainAndToken, clearChainAndToken } =
    useSelectChain();
  const [tokens, setTokens] = useState<Token[]>();

  const { swingSDK } = useCustomSwingSdk();

  useEffect(() => {
    if (selectedChain?.chain) {
      const sendTokens = !toChain
        ? swingSDK?.getAvailableSendTokens({
            fromChainSlug: selectedChain.chain.slug,
            type: 'swap',
          })
        : swingSDK?.getAvailableReceiveTokens({
            fromChainSlug: selectedChain.chain.slug,
            fromTokenSymbol: selectedChain.token?.symbol!,
            type: 'swap',
            toChainSlug: toChain.slug,
          });
      const nativeToken = sendTokens?.filter(
        (token: Token) =>
          token.symbol == selectedChain.chain?.nativeToken?.symbol,
      );
      console.log('native token', nativeToken);

      setTokens([...nativeToken!, ...sendTokens!]);
    }
  }, [selectedChain]);

  const handleSelectedChain = (selectedChain: ISelectedChain) => {
    setChainAndToken(selectedChain);

    if (selectedChain.chain && selectedChain.token) {
      onChainAndTokenSelected(selectedChain);
      clearChainAndToken();
    }
  };

  return (
    <div className="w-full">
      {selectedChain?.chain ? (
        <div className="relative flex flex-col space-y-7">
          <div className="fixed z-10 flex w-full items-center space-x-2 bg-white">
            <MdOutlineArrowBack
              className="h-8 w-8 rounded-2xl bg-gray-200 p-1 transition-all ease-in-out hover:cursor-pointer hover:bg-gray-300"
              onClick={clearChainAndToken}
            />
            <h3 className="mr-auto">Select Token</h3>
          </div>

          <div className="scrollbar scrollbar-thumb-black h-[400px] overflow-y-auto p-3">
            <div className="mt-10">
              {tokens?.map((token: Token, index: number) => (
                <SingleToken
                  key={index}
                  chain={selectedChain.chain!}
                  token={token}
                  onSelectChain={handleSelectedChain}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="scrollbar scrollbar-thumb-black mt-4 h-[400px] overflow-y-auto p-3">
          {chains?.map((chain: Chain, index: number) => (
            <SingleChain
              key={index}
              chain={chain}
              onSelectChain={handleSelectedChain}
            />
          ))}
        </div>
      )}
    </div>
  );
};
