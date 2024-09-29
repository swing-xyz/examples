import clsx from "clsx";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx("mx-auto max-w-[90%] px-4 sm:px-6 lg:px-8", className)}
    >
      {children}
    </div>
  );
}
