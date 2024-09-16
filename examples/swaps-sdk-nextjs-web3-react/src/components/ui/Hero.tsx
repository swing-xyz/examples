'use client';

import React from 'react';
import dynamic from 'next/dynamic';

import { Container } from './Container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { CircleBackground } from './CircleBackground';

const SwapSDK = dynamic(() => import('../Swap'), {
  ssr: false,
});

export function Hero() {
  return (
    <div className="overflow-hidden py-20 sm:py-32 lg:pb-32 xl:pb-36">
      <Container>
        <div className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
          <CircleBackground
            color="#a29bfe"
            className="animate-spin-slower hidden lg:block"
          />
        </div>
        <div className="mb-10 flex flex-col items-center justify-center gap-5">
          <p className="w-auto rounded-3xl bg-gray-800 px-3 py-2 text-[11px] font-bold">
            RapidPay API V3 is live 🎉
          </p>

          <h1 className="text-xl font-medium tracking-tight text-gray-900 md:text-2xl lg:text-4xl">
            <div>Quickly bridge MATIC to USDC 🚀</div>
          </h1>
        </div>

        <div className="flex w-full items-center justify-center">
          <Tabs defaultValue="deposit" className="lg:w-[40%]">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
              <TabsTrigger value="deposit">Bridge</TabsTrigger>
              <TabsTrigger value="withdraw" disabled>
                Stake (Coming Soon)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="deposit">
              <SwapSDK />
            </TabsContent>
            <TabsContent value="withdraw">Coming Soon</TabsContent>
          </Tabs>
        </div>
      </Container>
    </div>
  );
}
