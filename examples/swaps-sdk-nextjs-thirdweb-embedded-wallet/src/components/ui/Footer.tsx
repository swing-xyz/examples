"use client";

import { MdArrowDropUp } from "react-icons/md";
import { Container } from "./Container";

import { FaMoon } from "react-icons/fa";
import { FiMoreHorizontal, FiSettings, FiSun } from "react-icons/fi";

export function Footer() {
  return (
    <footer className="w-full">
      <Container>
        <div className="flex w-full justify-between">
          <div className="flex w-full">
            <div className="flex w-full items-center justify-between p-4">
              <div className="rounded-4xl flex min-h-5 min-w-5 gap-4 bg-gray-100 p-2">
                <div className=" rounded-4xl p2 text-[9px] font-bold text-gray-700">
                  <FiSun className="h-4 w-4" />
                </div>
                <div className="rounded-4xl p2 text-[9px] font-bold text-slate-300">
                  <FaMoon className="h-4 w-4" />
                </div>
              </div>
              <div className="rounded-4xl flex min-h-5 min-w-5 items-center gap-1 bg-gray-100 px-4 py-2">
                <h4 className="text-xs font-medium text-black">Activity</h4>
                <MdArrowDropUp />
              </div>
              <div className="rounded-4xl flex min-h-5 min-w-5 gap-4 bg-gray-100 p-2">
                <div className=" rounded-4xl p2 text-[9px] font-bold text-gray-700">
                  <FiSettings className="h-4 w-4" />
                </div>
                <div className="rounded-4xl p2 text-[9px] font-bold text-gray-700">
                  <FiMoreHorizontal className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
