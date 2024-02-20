import { TransferRoute } from '@swing.xyz/sdk';

export interface ISelectRoute {
    routes: TransferRoute[];
    title?: string;
    onRouteSelected: (route: TransferRoute) => void;
}

export interface IRoute {
    route: TransferRoute | any;
    onRouteSelected: (route: TransferRoute) => void;
}
