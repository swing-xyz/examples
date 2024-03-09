<<<<<<< HEAD
import { TransferRoute } from '@swing.xyz/sdk';

export interface ISelectRoute {
    routes: TransferRoute[];
    title?: string;
    onRouteSelected: (route: TransferRoute) => void;
}

export interface IRoute {
    route: TransferRoute | any;
    onRouteSelected: (route: TransferRoute) => void;
=======
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
>>>>>>> 17ed0bedd0282c70968c091fdded49e7dbedd508
}
