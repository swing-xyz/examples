import { GridPattern } from "./grid-pattern";
import { Button } from "./ui/button";

export function Hero() {
  return (
    <div className="relative isolate">
      <div className="absolute inset-0 -z-10 mx-0 max-w-none overflow-hidden">
        <div className="absolute left-1/2 top-0 ml-[-38rem] h-[36rem] w-[82rem] dark:[mask-image:linear-gradient(white,transparent)]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#36b49f] to-[#DBFF75] opacity-40 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] dark:from-[#36b49f]/30 dark:to-[#DBFF75]/30 dark:opacity-100">
            <GridPattern
              width={72}
              height={56}
              x="-12"
              y="4"
              squares={[
                [4, 3],
                [2, 1],
                [7, 3],
                [10, 6],
              ]}
              className="dark:fill-white/2.5 absolute inset-x-0 inset-y-[-50%] h-[200%] w-full skew-y-[-18deg] fill-black/40 stroke-black/50 mix-blend-overlay dark:stroke-white/5"
            />
          </div>
          <svg
            viewBox="0 0 1113 440"
            aria-hidden="true"
            className="absolute left-1/2 top-0 ml-[-19rem] w-[69.5625rem] fill-white blur-[26px] dark:hidden"
          >
            <path d="M.016 439.5s-9.5-300 434-300S882.516 20 882.516 20V0h230.004v439.5H.016Z" />
          </svg>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl pb-12 pt-32 sm:pb-20 sm:pt-40 lg:pt-48">
        <div className="text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-5xl">
            Swing Example Templates
          </h1>
          <p className="text-muted mt-6 text-lg leading-8">
            Kickstart your Swing integration with ready-to-ship repositories.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild variant="outline">
              <a href="#templates">Find your template</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
