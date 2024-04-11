"use client";

import React from "react";
import dynamic from "next/dynamic";

import { Container } from "./Container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { CircleBackground } from "./CircleBackground";

const SwapSDK = dynamic(() => import("../Swap"), {
  ssr: false,
});

export function Hero() {
  return (
    <div className="py-20 overflow-hidden sm:py-32 lg:pb-32 xl:pb-36">
      <Container>
        <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 -z-10">
          <CircleBackground
            color="#a29bfe"
            className="hidden lg:block animate-spin-slower"
          />
        </div>
        <div className="flex flex-col justify-center items-center mb-10 gap-5">
          <p className="bg-gray-800 rounded-3xl w-auto px-3 py-2 font-bold text-[11px]">
            RapidPay API V3 is live 🎉
          </p>

          <h1 className="text-xl md:text-2xl lg:text-4xl font-medium tracking-tight text-gray-900">
            <div>Quickly bridge MATIC to USDC 🚀</div>
          </h1>
        </div>

        <div className="w-full flex justify-center items-center">
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
