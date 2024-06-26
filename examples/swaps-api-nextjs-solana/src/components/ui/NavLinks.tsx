import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

export function NavLinks() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <>
      {[
        ["Swap", "#"],
        ["Governance", "#"],
        ["Research", "#"],
        ["Documentation", "#"],
      ].map(([label, href], index) => (
        <Link
          key={label}
          href={href!}
          className="relative -my-2 -mx-3 rounded-lg px-3 py-2 text-md text-gray-200 font-medium transition-colors delay-150 hover:text-gray-900 hover:delay-[0ms]"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === index && (
              <motion.span
                className="absolute inset-0 bg-gray-100 rounded-lg"
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
