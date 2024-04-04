"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Container } from "./Container";

const SwapSDK = dynamic(() => import("../Swap"), {
  ssr: false,
});

export function Hero() {
  return (
    <div className="w-full py-20 overflow-hidden sm:py-32 lg:pb-32 xl:pb-36">
      <Container className="w-full">
        <div className="w-full flex flex-col lg:gap-x-8 lg:gap-y-20">
          <div className="flex flex-col justify-center items-center relative z-10 mx-auto">
            <h1 className="text-4xl text-center font-medium tracking-tight text-gray-900">
              <div>BTC to ETH Crypto Exchange</div>
            </h1>
            <p className="mt-6 text-lg text-center text-gray-600 w-[60%]">
              By leveraging insights from our network of industry insiders,
              you’ll know exactly when to buy to maximize profit, and exactly
              when to sell to avoid painful losses.
            </p>
          </div>

          <div className="flex justify-center items-center">
            <SwapSDK />
          </div>
        </div>
      </Container>
    </div>
  );
}
