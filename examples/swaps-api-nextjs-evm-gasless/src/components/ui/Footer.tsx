"use client";

import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm border-t border-purple-500/20">
      <Container>
        <div className="flex items-center justify-center pb-12 pt-8 md:pt-6">
          <p className="mt-6 text-sm text-gray-400 md:mt-0">
            <span className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text font-medium">
              ⚡ Powered by Swing Protocol
            </span>
            {" "}&copy; {new Date().getFullYear()} - Building the future of DeFi
          </p>
        </div>
      </Container>
    </footer>
  );
}
