# Cross-chain Swaps using the Swing Widget in Next.js

MetaWallet is an example template showcasing how to use the [Swing Widget](https://developers.swing.xyz/reference/widget) to integrate cross-chain swaps on a wallet portfolio website.

This example is built with:

- [@swing.xyz/ui](https://developers.swing.xyz/reference/widget)
- [next.js](https://nextjs.org)
- [tailwind](https://tailwindcss.com)

## Demo

View the live demo https://swaps-widget-nextjs.vercel.app/

## Getting started

To get started with this template, first install the npm dependencies:

```bash
yarn install
```

Next, run the development server:

```bash
yarn dev --filter=swaps-widget-nextjs
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Swing integration

The [@swing.xyz/ui](https://developers.swing.xyz/reference/widget) can be found in [src/app/page.tsx](./src/app/page.tsx).

It utilizes the `Swap` component to enable a low-code, cross-chain swapping experience.

## Customizing

You can start editing this template by modifying the files in the `/src` folder. The site will auto-update as you edit these files.
