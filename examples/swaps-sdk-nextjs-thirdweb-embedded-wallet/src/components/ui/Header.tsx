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
import { useCustomSwingSdk } from "components/hooks/useSwingSDK";
import { shortenAddress } from "@thirdweb-dev/react";

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
  const { walletAddress, isConnected, connectWallet } = useCustomSwingSdk();

  return (
    <header>
      <nav>
        <Container className="relative z-50 flex justify-between py-8">
          <div className="relative z-10 flex items-center gap-16">
            <Link href="/" aria-label="Home">
              <h1 className="relative center align-middle font-bold text-xl italic bg-white px-5 py-2 rounded-full before:contents-[''] transition-all ease-in-out hover:before:absolute before:left-0 hover:before:left-2 before:top-0 hover:before:top-3 before:min-w-full before:h-full before:rounded-full before:-z-10 before:bg-purple-500">
                PowerSwap 🔥
              </h1>
            </Link>
            <div className="hidden lg:flex items-center lg:gap-10">
              <NavLinks />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Popover className="lg:hidden">
              {({ open }) => (
                <>
                  <Popover.Button
                    className="relative z-10 -m-2 inline-flex items-center rounded-lg stroke-gray-900 p-2 hover:bg-gray-200/50 hover:stroke-gray-600 active:stroke-gray-900 [&:not(:focus-visible)]:focus:outline-none"
                    aria-label="Toggle site navigation"
                  >
                    {({ open }) =>
                      open ? (
                        <ChevronUpIcon className="w-6 h-6" />
                      ) : (
                        <MenuIcon className="w-6 h-6" />
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
                          className="fixed inset-0 z-0 bg-gray-300/60 backdrop-blur"
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
                          className="absolute inset-x-0 top-0 z-0 px-6 pt-32 pb-6 origin-top shadow-2xl rounded-b-2xl bg-gray-50 shadow-gray-900/20"
                        >
                          <div className="space-y-4">
                            <MobileNavLink href="#about">
                              About $ALTCOIN
                            </MobileNavLink>
                            <MobileNavLink href="#team">Team</MobileNavLink>
                            <MobileNavLink href="#why">Why</MobileNavLink>
                            <MobileNavLink href="#faqs">FAQs</MobileNavLink>
                          </div>

                          <div className="flex flex-col mt-4 space-y-4">
                            <Button href="#altcoin">Connect Wallet</Button>

                            <Button
                              href="https://github.com/swing-xyz/examples"
                              className="space-x-2"
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
              href="https://github.com/swing-xyz/examples"
              className="hidden space-x-2 lg:block"
              variant="outline"
            >
              <FontAwesomeIcon size="lg" icon={faGithub} />
              <span>Fork on Github</span>
            </Button>

            {isConnected ? (
              <Button
                className="bg-[#06b6d4] hidden lg:block"
                href="#altcoin"
                onClick={async () => {
                  await navigator.clipboard.writeText(walletAddress);
                  alert("Wallet address copied to clipboard! 🚀");
                }}
              >
                {shortenAddress(walletAddress)}
              </Button>
            ) : (
              <Button
                href="#altcoin"
                className="hidden lg:block"
                onClick={connectWallet}
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </Container>
      </nav>
    </header>
  );
}
