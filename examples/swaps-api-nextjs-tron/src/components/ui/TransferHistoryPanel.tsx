import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Transaction,
  TransactionResponseAPIResponse,
} from "interfaces/history.interface";
import { MdOutlineHistory } from "react-icons/md";
import clsx from "clsx";
import { pendingStatuses } from "interfaces/send.interface";
import { ISwingServiceAPI } from "interfaces/swing-service.interface";

export const TransferHistoryPanel = ({
  swingServiceAPI,
  userAddress = "",
  className,
  onItemSelect,
}: {
  userAddress: string;
  className?: string;
  onItemSelect?: (token: Transaction) => void;
  swingServiceAPI: ISwingServiceAPI;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [historyList, sethistoryList] = useState<Transaction[] | undefined>([]);
  const [filteredItems, setFilteredItems] = useState<Transaction[] | undefined>(
    [],
  );

  useEffect(() => {
    if (isOpen && userAddress.length) {
      swingServiceAPI
        ?.getTransationHistoryRequest({ userAddress })
        .then((response: TransactionResponseAPIResponse | undefined) => {
          sethistoryList(response?.transactions);
          setFilteredItems(response?.transactions);
        });
    }
  }, [isOpen]);

  return (
    <Popover defaultOpen={false} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className={className}>
        <MdOutlineHistory className="size-7 group-hover:text-zinc-50" />
      </PopoverTrigger>
      <PopoverContent className="flex max-h-96 min-w-[50px] flex-col gap-y-2 overflow-scroll rounded-2xl p-2">
        <input
          id="width"
          defaultValue=""
          placeholder={"Search by status"}
          className="col-span-2 h-8 w-full rounded-xl border-none focus:border-2 focus:border-purple-300"
          onChange={(e) => {
            const historyResults = historyList?.filter(
              (history) =>
                history.status
                  .toLowerCase()
                  .startsWith(e.target.value.toLowerCase()) ||
                history
                  .fromChainSlug!.toLowerCase()
                  .startsWith(e.target.value.toLowerCase()) ||
                history
                  .toChainSlug!.toLowerCase()
                  .startsWith(e.target.value.toLowerCase()),
            );
            setFilteredItems(() => [...historyResults!]);
          }}
        />
        {filteredItems?.reverse().map((transaction, index) => (
          <div
            key={index}
            className="grid min-h-24 grid-cols-3 gap-x-1 rounded-2xl p-2 shadow hover:cursor-pointer hover:bg-zinc-100"
            onClick={() => onItemSelect?.(transaction)}
          >
            <div className="flex flex-col justify-between rounded-xl bg-purple-100 p-1">
              <span className="text-xs font-bold">ROUTE</span>
              <span className="text-xs">
                {transaction.fromChainSlug?.toUpperCase().substring(0, 3)} (
                {transaction.fromTokenSymbol}) {">"}{" "}
                {transaction.toChainSlug?.toUpperCase().substring(0, 3)} (
                {transaction.toTokenSymbol})
              </span>
            </div>

            <div className="flex flex-col justify-between rounded-xl bg-blue-100 p-1">
              <span className="text-xs font-bold">AMOUNT</span>
              <span className="text-xs">
                {transaction.toAmountUsdValue} USD
              </span>
            </div>

            <div className="flex flex-col justify-between rounded-xl bg-cyan-100 p-1">
              <span className="text-xs font-bold">STATUS</span>
              <span
                className={clsx("rounded-xl p-1 text-xs font-bold", {
                  "bg-green-400": transaction.status === "Completed",
                  "bg-yellow-400 text-black": pendingStatuses.includes(
                    transaction.status,
                  ),
                  "bg-red-400 text-white":
                    transaction.status === "Failed Source Chain" ||
                    "Failed Destination Chain",
                })}
              >
                {transaction.status}
              </span>
            </div>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};
