# Cross-chain Staking using the Swing SDK in Next.js

MetaWallet is an example template showcasing how to use the [Swing Widget](https://developers.swing.xyz/reference/widget) to integrate cross-chain staking on a wallet portfolio website.

This example is built with:

- [@swing.xyz/ui](https://developers.swing.xyz/reference/widget)
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

## Swing integration

The [@swing.xyz/ui](https://developers.swing.xyz/reference/widget) can be found in [components/Stake.tsx](./components/Stake.tsx).

It utilizes the SDK's `connect`, `getQuote` and `transfer` methods to interact with the customer's wallet, find the best route, and transfer the tokens to the staking contract.

## Customizing

You can start editing this template by modifying the files in the `/src` folder. The site will auto-update as you edit these files.
