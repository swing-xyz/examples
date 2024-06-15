import { getSigningCosmwasmClient } from 'osmojs';
import { Keplr } from '@keplr-wallet/types';
import { IBC_CHAINS } from "./constants";
import { GasPrice, calculateFee } from '@cosmjs/stargate';

declare const window: Window &
  typeof globalThis & {
    keplr: any,
    ethereum: any
  }

export const sendTransaction = async (data: any) => {
  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [data],
    });
    return txHash;
  } catch (e) {
    console.log(e);
  }
};

const getOsmosisClient = async (wallet: Keplr) => {
  const { chainId, rpcEndpoint } = IBC_CHAINS.osmosis;
  const signer: any = await wallet.getOfflineSignerAuto(chainId);
  // const client = await getSigningOsmosisClient({ rpcEndpoint, signer });
  const client = await getSigningCosmwasmClient({ rpcEndpoint, signer });
  return client;
};

export const sendOsmosisTx = async (wallet: Keplr, tx: string) => {
  const { from, meta } = JSON.parse(tx || '{}');
  const client = await getOsmosisClient(wallet);

  const estimatedGas = await client.simulate(from, meta.msgs, "");
  const gasMultiplier = 1.3;
  const gasPrice = '0.25uosmo';
  const fee = calculateFee(
    Math.trunc(estimatedGas * gasMultiplier),
    GasPrice.fromString(gasPrice)
  );

  const res = await client.signAndBroadcast(from, meta.msgs, fee);
  return res;
}