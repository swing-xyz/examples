'use client';

import { Button } from './Button';
import { CircleBackground } from './CircleBackground';
import { Container } from './Container';

export function CallToAction() {
    return (
        <section id="get-free-shares-today" className="relative py-20 overflow-hidden bg-gray-900 sm:py-28">
            <div className="absolute -translate-y-1/2 top-1/2 left-20 sm:left-1/2 sm:-translate-x-1/2">
                <CircleBackground color="#fff" className="animate-spin-slower" />
            </div>
            <Container className="relative">
                <div className="max-w-md mx-auto sm:text-center">
                    <h2 className="text-3xl font-medium tracking-tight text-white sm:text-4xl">Get your first Altcoin today</h2>
                    <p className="mt-4 text-lg text-gray-300">
                        It takes minutes to buy. Use <a>app.swing.xyz</a> to bridge and swap your assets into $Altcoin.
                    </p>
                    <div className="flex justify-center mt-8">
                        <Button href="#altcoin">Buy $ALTCOIN</Button>
                    </div>
                </div>
            </Container>
        </section>
    );
}
