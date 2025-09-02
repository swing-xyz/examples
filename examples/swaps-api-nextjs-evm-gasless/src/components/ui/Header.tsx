"use client";

import Link from "next/link";
import { Popover } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "./Button";
import { Container } from "./Container";
import { NavLinks } from "./NavLinks";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M5 6h14M5 18h14M5 12h14"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M17 14l-5-5-5 5"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MobileNavLink({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Popover.Button
      as={Link}
      className="block text-base leading-7 tracking-tight text-gray-700"
      href={href}
    >
      {children}
    </Popover.Button>
  );
}

export function Header() {
  return (
    <header className="bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm border-b border-purple-500/20">
      <nav>
        <Container className="relative z-50 flex items-center justify-between py-8">
          <div className="relative z-10 flex items-center gap-16">
            <Link href="/" aria-label="Home" className="text-2xl font-bold">
              <span className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text">
                🚀 Swing
                <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                  Bridge
                </span>
              </span>
            </Link>
          </div>
          <div className="hidden lg:flex lg:gap-10">
            <NavLinks />
          </div>
          <div className="flex items-center gap-6">
            <Popover className="lg:hidden">
              {({ open }) => (
                <>
                  <Popover.Button
                    className="relative z-10 -m-2 inline-flex items-center rounded-lg stroke-white p-2 hover:bg-purple-500/20 hover:stroke-purple-300 active:stroke-cyan-400 [&:not(:focus-visible)]:focus:outline-none"
                    aria-label="Toggle site navigation"
                  >
                    {({ open }) =>
                      open ? (
                        <ChevronUpIcon className="h-6 w-6" />
                      ) : (
                        <MenuIcon className="h-6 w-6" />
                      )
                    }
                  </Popover.Button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <>
                        <Popover.Overlay
                          static
                          as={motion.div}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-0 bg-gray-900/80 backdrop-blur"
                        />
                        <Popover.Panel
                          static
                          as={motion.div}
                          initial={{ opacity: 0, y: -32 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{
                            opacity: 0,
                            y: -32,
                            transition: { duration: 0.2 },
                          }}
                          className="absolute inset-x-0 top-0 z-0 origin-top rounded-b-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border-b border-purple-500/30 px-6 pb-6 pt-32 shadow-2xl shadow-purple-500/20"
                        >
                          <div className="space-y-4">
                            <MobileNavLink href="#">Swap</MobileNavLink>
                            <MobileNavLink href="#">API</MobileNavLink>
                            <MobileNavLink href="#">Docs</MobileNavLink>
                          </div>

                          <div className="mt-4 flex flex-col space-y-4">
                            <Button
                              href="https://github.com/swing-xyz/examples/tree/main/examples/swaps-api-nextjs-bitcoin"
                              className="space-x-2 text-white"
                              variant="outline"
                            >
                              <FontAwesomeIcon size="lg" icon={faGithub} />
                              <span>Fork on Github</span>
                            </Button>
                          </div>
                        </Popover.Panel>
                      </>
                    )}
                  </AnimatePresence>
                </>
              )}
            </Popover>

            <Button
              href="https://github.com/swing-xyz/examples/tree/main/examples/swaps-api-nextjs-evm-gasless"
              className="hidden space-x-2 text-white lg:block"
              variant="outline"
            >
              <FontAwesomeIcon size="lg" icon={faGithub} />
              <span>Fork on Github</span>
            </Button>
          </div>
        </Container>
      </nav>
    </header>
  );
}
