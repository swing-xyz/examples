"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "components/ui/accordion";
import { Checkbox } from "components/ui/checkbox";
import { slugify } from "lib/slugify";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Button } from "./ui/button";

import { XCircle } from "lucide-react";
import { cn } from "lib/utils";
import { keywordEntries } from "lib/keywords";
import { useMediaQuery } from "hooks/use-media-query";
import { Drawer, DrawerContent, DrawerTrigger } from "./ui/drawer";
import { useState } from "react";

export function Filters() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 960px)");

  if (isDesktop) return <Filter />;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost">Filter Templates</Button>
      </DrawerTrigger>

      <DrawerContent>
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
    <>
      <div className="flex items-center justify-between">
        <h4 className="font-bold">Filter Templates</h4>

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
          <XCircle className="h-4 w-4 mr-2 text-muted" /> Clear
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
                <AccordionTrigger className="text-sm px-3" iconSide="left">
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
                        className="flex flex-row items-center space-x-3 space-y-0 rounded-md bg-secondary text-secondary-foreground p-3 hover:bg-secondary/60 cursor-pointer text-sm"
                      >
                        <Checkbox
                          id={optionValue}
                          value={optionValue}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const nextSearchParams = new URLSearchParams(
                              searchParams
                            );

                            if (checked) {
                              nextSearchParams.append(filterKey, optionValue);
                            } else {
                              nextSearchParams.delete(filterKey, optionValue);
                            }

                            router.push(
                              pathname + "?" + nextSearchParams.toString(),
                              {
                                scroll: false,
                              }
                            );
                          }}
                        />

                        <span className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow font-normal">
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
    </>
  );
}
