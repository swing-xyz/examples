'use client';

import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import dynamic from 'next/dynamic';

import { AppScreen } from './AppScreen';
import { Container } from './Container';
import logoBbc from 'images/logos/bbc.svg';
import logoCbs from 'images/logos/cbs.svg';
import logoCnn from 'images/logos/cnn.svg';
import logoFastCompany from 'images/logos/fast-company.svg';
import logoForbes from 'images/logos/forbes.svg';
import logoHuffpost from 'images/logos/huffpost.svg';
import logoTechcrunch from 'images/logos/techcrunch.svg';
import logoWired from 'images/logos/wired.svg';

const SwapSDK = dynamic(() => import('../Swap'), {
  ssr: false,
});

function AppDemo() {
  return (
    <AppScreen>
      <AppScreen.Body>
        <React.Suspense fallback={null}>
          <SwapSDK />
        </React.Suspense>
      </AppScreen.Body>
    </AppScreen>
  );
}

export function Hero() {
  return (
    <div className="overflow-hidden py-20 sm:py-32 lg:pb-32 xl:pb-36">
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-20">
          <div className="relative z-10 mx-auto max-w-2xl lg:col-span-7 lg:max-w-none lg:pt-6 xl:col-span-6">
            <h1 className="text-4xl font-medium tracking-tight text-gray-900">
              <div>Buy at the top.</div>
              <div>Sell at the bottom.</div>
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              By leveraging insights from our network of industry insiders,
              you’ll know exactly when to buy to maximize profit, and exactly
              when to sell to avoid painful losses.
            </p>
          </div>

          <div className="relative mt-10 sm:mt-20 lg:col-span-6 lg:row-span-2 lg:mt-0 xl:col-span-6">
            <AppDemo />
          </div>

          <div className="relative mt-10 lg:col-span-7 lg:mt-0 xl:col-span-6">
            <p className="text-center text-sm font-semibold text-gray-900 lg:text-left">
              As featured in
            </p>
            <ul
              role="list"
              className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-x-10 gap-y-8 lg:mx-0 lg:justify-start"
            >
              {[
                ['Forbes', logoForbes],
                ['TechCrunch', logoTechcrunch],
                ['Wired', logoWired],
                ['CNN', logoCnn, 'hidden xl:block'],
                ['BBC', logoBbc],
                ['CBS', logoCbs],
                ['Fast Company', logoFastCompany],
                ['HuffPost', logoHuffpost, 'hidden xl:block'],
              ].map(([name, logo, className]) => (
                <li key={name} className={clsx('flex', className)}>
                  <Image src={logo} alt={name} className="h-8" unoptimized />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
}
