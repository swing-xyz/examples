import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/ui/drawer';
import { Button } from '../ui/Button';
import clsx from 'clsx';
import { ScrollArea } from '@/ui/scroll-area';

export interface MessageLog {
  time: string;
  log?: string;
  logType?: string;
}

export const StatusSheet = ({
  isOpen,
  logs = [],
  onCancel = () => {},
}: {
  isOpen: boolean;
  logs: MessageLog[];
  onCancel: () => void;
}) => {
  const LogMessage = ({ logMessage }: { logMessage: MessageLog }) => {
    const { time, log, logType } = logMessage;

    if (logType === 'CHAIN_SWITCH') {
      return (
        <div className="mb-2 flex min-h-[50px] gap-4 sm:flex-col">
          <span className={clsx('text-yellow-400')}>{time}</span>
          <div className="rounded-xl bg-zinc-700 p-1">
            <h3 className="text-sm sm:text-xs">{log}</h3>
          </div>
        </div>
      );
    } else if (logType === 'ACTION_REQUIRED') {
      return (
        <div className="mb-2 min-h-[50px] gap-4 sm:block lg:flex">
          <span className={clsx('text-yellow-400')}>{time}</span>
          <div className="rounded-xl bg-zinc-700 p-2">
            <h3 className="text-sm sm:text-xs">{log}</h3>
          </div>
        </div>
      );
    } else if (logType === 'ERROR') {
      <div>
        <span className={clsx('text-red-400')}>{time}</span>: {log}
      </div>;
    } else {
      <div>
        <span className={clsx('text-zinc-400')}>{time}</span>: {log}
      </div>;
    }
  };

  return (
    <Drawer open={isOpen}>
      <DrawerContent className="border-zinc-700 bg-black">
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Transaction Processing</DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <ScrollArea className="flex max-h-[200px] flex-col justify-start space-x-2  rounded bg-zinc-800 text-sm sm:text-xs">
              <div className="w-full">
                <div className="">
                  <span className="text-zinc-400">
                    {new Date().toISOString()}
                  </span>
                  : Initiating transaction....
                </div>
                {logs.map((log, index) => (
                  <LogMessage key={index} logMessage={log} />
                ))}
              </div>
            </ScrollArea>
          </div>
          <DrawerFooter>
            <Button
              className={clsx(
                'flex w-full cursor-pointer items-center bg-red-400',
              )}
              onClick={onCancel}
            >
              Cancel Transacton
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
