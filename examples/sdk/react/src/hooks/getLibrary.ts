import { Web3Provider } from "@ethersproject/providers";

const getLibrary = (provider: any) => {
  const library = new Web3Provider(
    provider,
    typeof provider.chainId === 'number'
      ? provider.chainId
      : typeof provider.chainId === 'string'
      ? parseInt(provider.chainId, 10)
      : 'any'
  );
  return library;
}

export default getLibrary;