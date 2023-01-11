import clsx from "clsx";

export function AppScreen({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={clsx("flex flex-col", className)}>{children}</div>;
}

AppScreen.Header = function AppScreenHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="px-4 mt-6 text-white">{children}</div>;
};

AppScreen.Title = function AppScreenTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="text-2xl text-white">{children}</div>;
};

AppScreen.Subtitle = function AppScreenSubtitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="text-sm text-gray-500">{children}</div>;
};

AppScreen.Body = function AppScreenBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("flex-auto mt-6 rounded-t-2xl", className)}>
      {children}
    </div>
  );
};
