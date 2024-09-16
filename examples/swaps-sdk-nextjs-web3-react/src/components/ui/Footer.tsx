'use client';

import { Container } from './Container';

import { FaMoon } from 'react-icons/fa';
import { FiMoreHorizontal, FiSettings, FiSun } from 'react-icons/fi';

export function Footer() {
  return (
    <footer className="w-full">
      <Container>
        <div className="flex w-full justify-between">
          <div className="flex w-full">
            <div className="flex w-full items-center justify-between p-4">
              <div className="rounded-4xl flex min-h-5 min-w-5 gap-4 bg-zinc-700 p-2">
                <div className=" rounded-4xl p2 text-[9px] font-bold text-gray-700">
                  <FiSun className="h-5 w-5" />
                </div>
                <div className="rounded-4xl p2 text-[9px] font-bold text-slate-300">
                  <FaMoon className="h-5 w-5" />
                </div>
              </div>
              <div className="rounded-4xl flex min-h-5 min-w-5 gap-4 bg-zinc-700 p-2">
                <div className=" rounded-4xl p2 text-[9px] font-bold text-gray-700">
                  <FiSettings className="h-4 w-4" />
                </div>
                <div className="rounded-4xl p2 text-[9px] font-bold text-gray-700">
                  <FiMoreHorizontal className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
