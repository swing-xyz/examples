import type { NextPage } from "next";
import dynamic from "next/dynamic";

const Swap = dynamic(() => import("../components/Swap"), {
  ssr: false,
});

const SwapPage: NextPage = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <Swap />
    </div>
  );
};

export default SwapPage;
