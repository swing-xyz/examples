"use client";

import React from "react";
import { Container } from "./Container";

import logoCnn from "images/logos/cnn.svg";
import logoForbes from "images/logos/forbes.svg";
import logoTechcrunch from "images/logos/techcrunch.svg";
import logoWired from "images/logos/wired.svg";

import SwapSDK from "../Swap";
import Image from "next/image";
import clsx from "clsx";

export function Hero() {
  return (
    <div className="w-full py-20 overflow-hidden sm:py-32 lg:pb-32 xl:pb-36">
      <Container className="flex flex-col gap-16 w-full">
        <div className="w-full flex flex-col lg:gap-x-8 lg:gap-y-20">
          <div className="flex flex-col justify-center items-center relative z-10 mx-auto">
            <h1 className="text-4xl text-center font-medium tracking-tight text-gray-900">
              <div>
                ETH to BTC Crypto{" "}
                <span className="text-cyan-500">Exchange</span>
              </div>
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

        <div className="w-full">
          <p className="text-sm font-semibold text-center text-gray-900">
            Trusted By
          </p>
          <ul
            role="list"
            className="flex flex-wrap justify-center max-w-xl mx-auto mt-8 gap-x-10 gap-y-8"
          >
            {[
              ["Forbes", logoForbes],
              ["TechCrunch", logoTechcrunch],
              ["Wired", logoWired],
              ["CNN", logoCnn, "hidden xl:block"],
            ].map(([name, logo, className]) => (
              <li key={name} className={clsx("flex", className)}>
                <Image src={logo} alt={name} className="h-8" unoptimized />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </div>
  );
}
