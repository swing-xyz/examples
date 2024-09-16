'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'components/ui/accordion';
import { Checkbox } from 'components/ui/checkbox';
import { slugify } from 'lib/slugify';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Button } from './ui/button';

import { XCircle } from 'lucide-react';
import { cn } from 'lib/utils';
import { keywordEntries } from 'lib/keywords';
import { useMediaQuery } from 'hooks/use-media-query';
import { Drawer, DrawerContent, DrawerTrigger } from './ui/drawer';
import { useState } from 'react';

export function Filters() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 960px)');

  if (isDesktop) return <Filter />;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost">Filter</Button>
      </DrawerTrigger>

      <DrawerContent className="p-4">
        <Filter />
      </DrawerContent>
    </Drawer>
  );
}

function Filter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="relative overflow-auto">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-bold">Filter</h4>

        <Button
          className={cn({
            invisible: !searchParams.size,
          })}
          variant="secondary"
          size="sm"
          onClick={() => {
            router.push(pathname, {
              scroll: false,
            });
          }}
        >
          <XCircle className="text-muted mr-2 h-4 w-4" /> Clear
        </Button>
      </div>

      <form>
        <Accordion
          type="multiple"
          defaultValue={keywordEntries.map(([filter]) => filter)}
        >
          {keywordEntries.map(([filter, options]) => {
            const filterKey = slugify(filter);
            const filterValues = searchParams.getAll(filterKey);

            return (
              <AccordionItem key={filterKey} value={filter}>
                <AccordionTrigger className="px-3 text-sm" iconSide="left">
                  {filter}
                </AccordionTrigger>

                <AccordionContent className="space-y-2">
                  {options.map((option) => {
                    const optionValue = slugify(option);
                    const isChecked = filterValues.includes(optionValue);

                    return (
                      <label
                        key={optionValue}
                        htmlFor={optionValue}
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/60 flex cursor-pointer flex-row items-center space-x-3 space-y-0 rounded-md p-3 text-sm"
                      >
                        <Checkbox
                          id={optionValue}
                          value={optionValue}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const nextSearchParams = new URLSearchParams(
                              searchParams,
                            );

                            if (checked) {
                              nextSearchParams.append(filterKey, optionValue);
                            } else {
                              nextSearchParams.delete(filterKey, optionValue);
                            }

                            router.push(
                              pathname + '?' + nextSearchParams.toString(),
                              {
                                scroll: false,
                              },
                            );
                          }}
                        />

                        <span className="flex-grow text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </form>
    </div>
  );
}
