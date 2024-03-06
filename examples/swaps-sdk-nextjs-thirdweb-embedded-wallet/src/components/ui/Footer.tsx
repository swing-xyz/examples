"use client";

import {
  MdArrowDropUp,
} from "react-icons/md";
import { Container } from "./Container";

import { FaMoon } from "react-icons/fa";
import { FiMoreHorizontal, FiSettings, FiSun } from "react-icons/fi";

export function Footer() {
  return (
    <footer className="w-full">
      <Container>
        <div className="w-full flex justify-between">
          <div className="w-full flex">
            <div className="w-full flex justify-between items-center p-4">
              <div className="flex min-w-5 min-h-5 rounded-4xl bg-gray-100 p-2 gap-4">
                <div className=" text-gray-700 rounded-4xl text-[9px] font-bold p2">
                  <FiSun className="w-4 h-4" />
                </div>
                <div className="text-slate-300 rounded-4xl text-[9px] font-bold p2">
                  <FaMoon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center min-w-5 min-h-5 rounded-4xl bg-gray-100 py-2 px-4 gap-1">
                <h4 className="text-black text-xs font-medium">Activity</h4>
                <MdArrowDropUp />
              </div>
              <div className="flex min-w-5 min-h-5 rounded-4xl bg-gray-100 p-2 gap-4">
                <div className=" text-gray-700 rounded-4xl text-[9px] font-bold p2">
                  <FiSettings className="w-4 h-4" />
                </div>
                <div className="text-gray-700 rounded-4xl text-[9px] font-bold p2">
                  <FiMoreHorizontal className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
