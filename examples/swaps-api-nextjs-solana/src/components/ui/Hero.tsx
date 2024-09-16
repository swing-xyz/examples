'use client';

import React from 'react';
import { Container } from './Container';

import sols from 'images/logos/sols.png';

import SwapSDK from '../Swap';
import Image from 'next/image';

export function Hero() {
  return (
    <div className="w-full overflow-hidden py-2">
      <Container className="flex w-full grow justify-start gap-16">
        <div className="hidden w-full grow flex-col justify-between lg:flex">
          <div className="relative flex max-h-[50%] w-full justify-center">
            <Image
              src={sols}
              alt={'sols'}
              className="absolute left-20 top-20 w-72 xl:top-28 xl:w-96"
              unoptimized
            />
            <Image
              src={sols}
              alt={'sols2'}
              className="absolute w-72 rotate-90 xl:top-32 xl:w-96"
              unoptimized
            />
          </div>
          <div className="flex h-[50%] w-full flex-col justify-start gap-y-2">
            <p className="mt-auto text-6xl font-bold text-gray-200">
              Wicked Fast <br />
              Bridging On Solana!
            </p>
            <p className="mt-6 text-sm text-gray-400 md:mt-0">
              &copy; Copyright {new Date().getFullYear()}. All rights reserved.
            </p>
          </div>
        </div>
        <div className="min-h-[80vh] w-[70vw] grow">
          <SwapSDK />
        </div>
      </Container>
    </div>
  );
}
