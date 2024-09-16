'use client';

import React from 'react';
import { Container } from './Container';

import sols from 'images/logos/sols.png';

import SwapSDK from '../Swap';
import Image from 'next/image';

export function Hero() {
  return (
    <div className="w-full overflow-hidden py-2">
      <Container className="flex w-full grow justify-center gap-16">
        <div className="min-h-[80vh] w-[70vw] grow">
          <SwapSDK />
        </div>
      </Container>
    </div>
  );
}
