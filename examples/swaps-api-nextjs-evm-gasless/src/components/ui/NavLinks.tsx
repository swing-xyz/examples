import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export function NavLinks() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <>
      {[
        ["Swap", "#"],
        ["API", "#"],
        ["Docs", "#"],
      ].map(([label, href], index) => (
        <Link
          key={label}
          href={href!}
          className="relative -mx-3 -my-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors delay-150 hover:text-transparent hover:bg-gradient-to-r hover:from-purple-400 hover:to-cyan-400 hover:bg-clip-text hover:delay-[0ms] font-medium"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === index && (
              <motion.span
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm border border-purple-400/30"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <span className="relative z-10">{label}</span>
        </Link>
      ))}
    </>
  );
}
