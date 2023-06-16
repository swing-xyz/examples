# Altcoin Example

Altcoin is an example template showcasing how to use the [Swing SDK](https://swing.xyz/developers) to integrate cross-chain swaps on a token website.

> "ALTCOIN" is a fake token used for demonstration purposes only.

This example is built with:

- [@swing.xyz/sdk](https://swing.xyz/developers)
- [next.js](https://nextjs.org)
- [tailwind](https://tailwindcss.com)

## Getting started

To get started with this template, first install the npm dependencies:

```bash
yarn install
```

Next, run the development server:

```bash
yarn dev --filter=sdk-nextjs
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Swing integration

The [@swing.xyz/sdk](https://swing.xyz/developers) can be found in [src/components/SwingSDK.tsx](./src/components/SwingSDK.tsx).

It utilizes the SDK's `connect`, `getQuote` and `transfer` methods to interact with the customer's wallet, find the best route, and transfer the funds to a made up "ALTCOIN" token.

## Customizing

You can start editing this template by modifying the files in the `/src` folder. The site will auto-update as you edit these files.
