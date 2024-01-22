import { Withdraw } from "@swing.xyz/ui";
import "@swing.xyz/ui/theme.css";

export default function SwapPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <Withdraw
        title="Withdraw with MetaWallet"
        projectId="example-withdraw-widget-nextjs"
        debug
      />
    </div>
  );
}
