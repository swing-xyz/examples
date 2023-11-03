# Cross-chain Staking using the Swing SDK in Next.js

MetaWallet is an example template showcasing how to use the [Swing SDK](https://developers.swing.xyz/reference/sdk) to integrate cross-chain staking on a wallet portfolio website.

This example is built with:

- [@swing.xyz/sdk](https://developers.swing.xyz/reference/sdk)
- [wagmi](https://wagmi.sh/react/getting-started)
- [next.js](https://nextjs.org)
- [tailwind](https://tailwindcss.com)

## Getting started

To get started with this template, first install the npm dependencies:

```bash
yarn install
```

Next, run the development server:

```bash
yarn dev --filter=staking-sdk-nextjs
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Swing Integration

The [@swing.xyz/sdk](https://developers.swing.xyz/reference/sdk) can be found in the [Stake](./src/components/Stake.tsx) component.

It utilizes the SDK's `getQuote` and `transfer` methods to interact with the customer's wallet, find the best route, and transfer the tokens to the chosen staking provider.

## Wagmi Integration

You can find the Wagmi configuration in the [WagmiProvider](./src/components/WagmiProvider.tsx) component.

Then see how the [useConnectWallet](./src/hooks/useConnectWallet.tsx) hook is used to sync the Wagmi wallet connection with the Swing SDK.

## Customizing

You can start editing this template by modifying the files in the `/src` folder. The site will auto-update as you edit these files.
