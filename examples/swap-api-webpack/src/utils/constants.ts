import { ChainInfo } from "@keplr-wallet/types";

export const IBC_CHAINS = {
    cosmos: {
      chainId: "cosmoshub-4",
      restEndpoint: "https://cosmos-mainnet-rpc.allthatnode.com:1317",
      rpcEndpoint: `https://cosmos-mainnet-archive.allthatnode.com:26657`,
      testToken:
        "ibc/932D6003DA334ECBC5B23A071B4287D0A5CC97331197FE9F1C0689BA002A8421",
      chainInfo: {
        feeCurrencies: [
          { coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 },
        ],
      } as ChainInfo,
      channelMap: { sourceChannel: "channel-293" },
    },
    osmosis: {
      chainId: "osmosis-1",
      restEndpoint: "https://rpc.osmosis.zone",
      rpcEndpoint: "https://rpc.osmosis.zone:443",
      testToken:
        "ibc/62F82550D0B96522361C89B0DA1119DE262FBDFB25E5502BC5101B5C0D0DBAAC",
      chainInfo: {
        feeCurrencies: [
          { coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6 },
        ],
      } as ChainInfo,
      channelMap: { sourceChannel: "channel-2186" },
    },
    evmos: {
      chainId: "evmos_9001-2",
      restEndpoint: "https://api.evmos.org",
      rpcEndpoint: "https://evmos-rpc.polkachu.com",
      testToken: "uusdc",
      chainInfo: {
        feeCurrencies: [
          { coinDenom: "EVMOS", coinMinimalDenom: "aevmos", coinDecimals: 6 },
        ],
      } as ChainInfo,
      channelMap: { sourceChannel: "channel-94" },
    },
  };