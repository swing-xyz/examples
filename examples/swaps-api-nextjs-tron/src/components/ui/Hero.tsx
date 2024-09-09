"use client";

import React from "react";
import { Container } from "./Container";

import sols from "images/logos/sols.png";

import SwapSDK from "../Swap";
import Image from "next/image";

export function Hero() {
  return (
    <div className="w-full py-2 overflow-hidden">
      <Container className="flex grow justify-center gap-16 w-full">
        <div className="grow min-h-[80vh] w-[70vw]">
          <SwapSDK />
        </div>
      </Container>
    </div>
  );
}
