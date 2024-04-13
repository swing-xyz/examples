"use client";

import { Container } from "./Container";

export function Footer() {
  return (
    <footer>
      <Container>
        <div className="flex justify-center items-center pt-8 pb-12 md:pt-6">
          <p className="mt-6 text-sm text-gray-500 md:mt-0">
            &copy; Copyright {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
