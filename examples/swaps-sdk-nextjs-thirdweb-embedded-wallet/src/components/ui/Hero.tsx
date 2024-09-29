"use client";

import React from "react";
import dynamic from "next/dynamic";

import { AppScreen } from "./AppScreen";
import { Container } from "./Container";

const SwapSDK = dynamic(() => import("../Swap"), {
  ssr: false,
});

function AppDemo() {
  return (
    <AppScreen>
      <AppScreen.Body>
        <React.Suspense fallback={null}>
          <SwapSDK />
        </React.Suspense>
      </AppScreen.Body>
    </AppScreen>
  );
}

export function Hero() {
  return (
    <div className="overflow-hidden py-5">
      <Container>
        <div className="flex items-center justify-center">
          <AppDemo />
        </div>
      </Container>
    </div>
  );
}
