import { TransferRoute } from "@swing.xyz/sdk";

export interface ISelectRoute {
  routes: TransferRoute[];
  title?: string;
  // eslint-disable-next-line no-unused-vars
  onRouteSelected: (route: TransferRoute) => void;
}

export interface IRoute {
  route: TransferRoute;
  // eslint-disable-next-line no-unused-vars
  onRouteSelected: (route: TransferRoute) => void;
}
