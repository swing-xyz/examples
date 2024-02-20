'use client';

import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import dynamic from 'next/dynamic';

import { AppScreen } from './AppScreen';
import { Container } from './Container';
import logoBbc from 'images/logos/bbc.svg';
import logoCbs from 'images/logos/cbs.svg';
import logoCnn from 'images/logos/cnn.svg';
import logoFastCompany from 'images/logos/fast-company.svg';
import logoForbes from 'images/logos/forbes.svg';
import logoHuffpost from 'images/logos/huffpost.svg';
import logoTechcrunch from 'images/logos/techcrunch.svg';
import logoWired from 'images/logos/wired.svg';

const SwapSDK = dynamic(() => import('../Swap'), {
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
        <div className="py-5 overflow-hidden">
            <Container>
                <div className="flex justify-center items-center">
                    <AppDemo />
                </div>
            </Container>
        </div>
    );
}
