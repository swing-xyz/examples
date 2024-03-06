import { TransferRoute } from "@swing.xyz/sdk";
import { FC } from "react";
import { ISelectRoute } from "app/interfaces/IRouteSelector";
import { Route } from "./Route";

export const SelectRoute: FC<ISelectRoute> = ({
  routes,
  onRouteSelected,
}: ISelectRoute) => {
  const groupedRoutes = routes.sort(
    (a, b) => Number(a.quote.amount) - Number(b.quote.amount)
  ) as TransferRoute[];
  // @ts-expect-error ignore
  groupedRoutes[0]["isBest"] = true;

  return (
    <div className="w-full">
      <div className="h-[400px] mt-4 scrollbar scrollbar-thumb-black overflow-y-auto p-3">
        {groupedRoutes?.map((route: TransferRoute, index: number) => (
          <Route key={index} route={route} onRouteSelected={onRouteSelected} />
        ))}
      </div>
    </div>
  );
};
