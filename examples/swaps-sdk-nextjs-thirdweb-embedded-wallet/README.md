# Cross-chain Swaps using the Swing SDK in Next.js

Altcoin is an example template showcasing how to use the [Swing SDK](https://developers.swing.xyz/reference/sdk) to integrate cross-chain swaps on a token website.

This example is built with:

- [@swing.xyz/sdk](https://developers.swing.xyz/reference/sdk)
- [@thirdweb-dev/react](https://portal.thirdweb.com/react)
- [@thirdweb-dev/sdk](https://portal.thirdweb.com/typescript)
- [Next.js App Router](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)

> "ALTCOIN" is a fake token used for demonstration purposes only.

## Demo

View the live demo https://swaps-sdk-nextjs.vercel.app/

## Swing Integration

The [@swing.xyz/sdk](https://developers.swing.xyz/reference/sdk) can be found in [src/components/Swap.tsx](./src/components/Swap.tsx).

It utilizes the SDK's `connect`, `getQuote` and `transfer` methods to interact with the customer's wallet, find the best route, and transfer the funds to a made up "ALTCOIN" token.

## Getting started

To get started with this template, first install the npm dependencies:

```bash
yarn install
```

Next, run the development server:

```bash
yarn dev --filter=swaps-sdk-nextjs-thirdweb-embedded-wallet
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Customizing

You can start editing this template by modifying the files in the `/src` folder. The site will auto-update as you edit these files.
