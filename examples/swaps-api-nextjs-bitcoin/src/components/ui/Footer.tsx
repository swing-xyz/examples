"use client";

import { Container } from "./Container";

export function Footer() {
  return (
    <footer>
      <Container>
        <div className="flex items-center justify-center pb-12 pt-8 md:pt-6">
          <p className="mt-6 text-sm text-gray-500 md:mt-0">
            &copy; Copyright {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
