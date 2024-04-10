# Cross-chain Swaps using the Swing SDK in Next.js

Altcoin is an example template showcasing how to use the [Swing SDK](https://developers.swing.xyz/reference/sdk) to integrate cross-chain swaps on a token website.

This example is built with:

- [@thirdweb-dev/react](https://portal.thirdweb.com/react)
- [@thirdweb-dev/sdk](https://portal.thirdweb.com/typescript)
- [Next.js App Router](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)

## Demo

View the live demo https://swaps-api-nextjs.vercel.app/

## Swing Integration

>The implementation of Swing's [Cross-chain API](https://developers.swing.xyz/reference/api) can be found in [src/components/Swap.tsx](./src/components/Swap.tsx).

This example demonstrates how you can perform a cross-chain transaction between the Bitcoin and Ethereum chains. 

In this example, we will be using thirdweb's SDK and [xDEFI's injected SDK](https://docs.xdefi.io/docs) to connect to a user's wallet. The process/steps for performing a BTC to ETH transaction and vice versa, is as follows:

- Getting a [quote](https://developers.swing.xyz/reference/api/cross-chain/1169f8cbb6937-request-a-transfer-quote) and selecting the best route
- Sending a [transaction](https://developers.swing.xyz/reference/api/cross-chain/d83d0d65028dc-send-transfer)

## Getting started

To get started with this template, first install the npm dependencies:

```bash
yarn install
```

Next, run the development server:

```bash
yarn dev --filter=swaps-sdk-api
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Customizing

You can start editing this template by modifying the files in the `/src` folder. The site will auto-update as you edit these files.
