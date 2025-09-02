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
    <div className="w-full overflow-hidden py-20 sm:py-32 lg:pb-32 xl:pb-36 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
      <Container className="flex w-full flex-col gap-16">
        <div className="flex w-full flex-col lg:gap-x-8 lg:gap-y-20">
          <div className="relative z-10 mx-auto flex flex-col items-center justify-center">
            <h1 className="text-center text-4xl font-bold tracking-tight">
              <div className="text-transparent bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text">
                Gasless Cross-Chain Crypto{" "}
                <span className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
                  Swapping
                </span>
              </div>
            </h1>
            <p className="mt-6 w-[70%] text-center text-lg text-gray-300 leading-relaxed">
              ⚡ Experience the future of DeFi with seamless cross-chain swaps.
              <br className="hidden sm:block" />
              Bridge assets across multiple blockchains with zero hassle.
            </p>
          </div>

          <div className="flex items-center justify-center">
            <SwapSDK />
          </div>
        </div>

        <div className="w-full">
          <p className="text-center text-sm font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text uppercase tracking-wider">
            🌟 Powered By Leading Bridges
          </p>
          <ul
            role="list"
            className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-x-10 gap-y-8"
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
