"use client";

import React from "react";
import { Container } from "./Container";

import sols from "images/logos/sols.png";

import SwapSDK from "../Swap";
import Image from "next/image";

export function Hero() {
  return (
    <div className="w-full py-2 overflow-hidden">
      <Container className="flex grow justify-start gap-16 w-full">
        <div className="w-full hidden lg:flex flex-col justify-between grow">
          <div className="relative w-full max-h-[50%] flex justify-center">
            <Image
              src={sols}
              alt={"sols"}
              className="absolute xl:top-28 top-20 left-20 xl:w-96 w-72"
              unoptimized
            />
            <Image
              src={sols}
              alt={"sols2"}
              className="absolute xl:top-32 xl:w-96 w-72 rotate-90"
              unoptimized
            />
          </div>
          <div className="w-full h-[50%] flex flex-col justify-start gap-y-2">
            <p className="text-6xl text-gray-200 font-bold mt-auto">
              Wicked Fast <br />
              Bridging On Solana!
            </p>
            <p className="mt-6 text-sm text-gray-400 md:mt-0">
              &copy; Copyright {new Date().getFullYear()}. All rights reserved.
            </p>
          </div>
        </div>
        <div className="grow min-h-[80vh] w-[70vw]">
          <SwapSDK />
        </div>
      </Container>
    </div>
  );
}
