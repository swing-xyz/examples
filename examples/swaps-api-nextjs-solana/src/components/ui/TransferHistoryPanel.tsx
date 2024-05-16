import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Transaction,
  TransactionResponseAPIResponse,
} from "interfaces/history.interface";
import { MdOutlineHistory } from "react-icons/md";
import { getTransationHistory } from "services/requests";
import clsx from "clsx";
import { pendingStatuses } from "interfaces/send.interface";

export const TransferHistoryPanel = ({
  userAddress = "",
  className,
  onItemSelect,
}: {
  userAddress: string;
  className?: string;
  onItemSelect?: (token: Transaction) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [historyList, sethistoryList] = useState<Transaction[]>([]);
  const [filteredItems, setFilteredItems] = useState<Transaction[]>([]);

  useEffect(() => {
    if (isOpen && userAddress.length) {
      getTransationHistory({ userAddress }).then(
        (response: TransactionResponseAPIResponse) => {
          sethistoryList(response.transactions);
          setFilteredItems(response.transactions);
        },
      );
    }
  }, [isOpen]);

  return (
    <Popover defaultOpen={false} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className={className}>
        <MdOutlineHistory className="size-7 group-hover:text-zinc-50" />
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-y-2 rounded-2xl min-w-[50px] max-h-96 overflow-scroll">
        <input
          id="width"
          defaultValue=""
          placeholder={"Search by status"}
          className="col-span-2 h-8 focus:border-2 focus:border-purple-300 rounded-xl border-none w-full"
          onChange={(e) => {
            const historyResults = historyList?.filter((history) =>
              history.status
                .toLowerCase()
                .startsWith(e.target.value.toLowerCase()),
            );
            setFilteredItems(() => [...historyResults!]);
          }}
        />
        {filteredItems?.map((transaction, index) => (
          <div
            key={index}
            className="flex gap-y-2 flex-col justify-between p-3 hover:bg-zinc-300 hover:cursor-pointer rounded-xl ring-1"
            onClick={() => onItemSelect?.(transaction)}
          >
            <div className="flex justify-start items-center gap-x-2">
              <span className="p-1 rounded-xl bg-purple-300">
                {transaction.fromChainSlug.toUpperCase()}
              </span>
              <span className="p-1 rounded-xl bg-cyan-200">
                {transaction.toChainSlug.toUpperCase()}
              </span>
            </div>
            <span
              className={clsx("text-center rounded-xl p-1", {
                "bg-green-400": transaction.status === "Completed",
                "bg-yellow-400 text-black": pendingStatuses.includes(
                  transaction.status,
                ),
                "bg-red-400 text-white": transaction.status === "Failed",
              })}
            >
              {transaction.status}
            </span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};
