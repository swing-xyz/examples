"use client";

import { faGithub } from "@fortawesome/free-brands-svg-icons";
import {
  faGear,
  faLineChart,
  faMessage,
  faOtter,
  faQuestionCircle,
  faRotate,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="group relative hidden h-screen bg-slate-800 py-5 pt-8 transition-all duration-700 ease-in-out md:flex md:w-40 md:flex-col lg:w-52">
      <Link
        id="sidebar-item-Home"
        className="group relative flex items-center px-4 py-2 text-orange-300 hover:bg-slate-700"
        href="/"
      >
        <div className="mr-2 flex items-center justify-center text-orange-500">
          <FontAwesomeIcon icon={faOtter} />
        </div>
        <span className="truncate">MetaWallet</span>
      </Link>

      <div className="flex flex-col overflow-y-auto">
        <nav className="mt-6">
          <div className="space-y-3">
            <Link
              id="sidebar-item-Portfolio"
              className="group relative flex items-center px-4 py-2 text-white hover:bg-slate-700"
              href="/"
            >
              <div className="mr-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faLineChart} />
              </div>
              <span className="truncate">Portfolio</span>
            </Link>

            <Link
              id="sidebar-item-Swap"
              className="text-midnight-primary group relative flex items-center bg-slate-700 px-4 py-2 font-semibold dark:text-white"
              href="/"
              aria-current="page"
            >
              <div className="bg-midnight-primary absolute right-0 hidden h-6 w-0.5 md:inline-block"></div>
              <div className="mr-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faRotate} />
              </div>
              <span className="truncate">Swaps</span>
            </Link>

            <Link
              id="sidebar-item-Watchlist"
              className="group relative flex items-center px-4 py-2 text-white hover:bg-slate-700"
              href="/"
            >
              <div className="mr-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faStar} />
              </div>
              <span className="truncate">Watchlist</span>
            </Link>
          </div>
        </nav>
      </div>

      <div className="mt-3 flex flex-1">
        <div className="w-full">
          <Link
            id="sidebar-item-Settings"
            className="group relative flex items-center px-4 py-2 text-white hover:bg-slate-700"
            href="/"
          >
            <div className="mr-2 flex items-center justify-center">
              <FontAwesomeIcon icon={faGear} />
            </div>
            <span className="truncate">Settings</span>
          </Link>
        </div>
      </div>

      <div className="mb-8 space-y-6">
        <div>
          <div className="mt-3 w-full">
            <Link
              href="/"
              className="group relative flex items-center px-4 py-2 text-white hover:bg-slate-700"
            >
              <div className="mr-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faQuestionCircle} />
              </div>
              <span className="truncate">FAQ</span>
            </Link>
          </div>
          <div className="mt-3">
            <Link
              href="/"
              className="group relative flex items-center px-4 py-2 text-white hover:bg-slate-700"
            >
              <div className="mr-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faMessage} />
              </div>
              <span className="truncate">Contact</span>
            </Link>
          </div>
        </div>
      </div>

      <Link
        id="fork-on-github"
        href="https://github.com/swing-xyz/examples"
        className="-mb-5 flex cursor-pointer items-center space-x-2 border-t border-slate-700 px-6 py-4 text-white hover:bg-slate-700"
        target={"_blank"}
      >
        <FontAwesomeIcon size="lg" icon={faGithub} />
        <div className="text-sm font-medium">Fork on Github</div>
      </Link>
    </aside>
  );
}
