"use client";

import React from "react";
import { Container } from "./Container";

import SwapSDK from "../Swap";

export function Hero() {
  return (
    <div className="relative w-full overflow-hidden py-2">
      <Container className="flex w-full grow justify-center gap-16">
        <div className="relative min-h-[80vh] w-[70vw] grow">
          <SwapSDK />
        </div>
      </Container>
    </div>
  );
}
