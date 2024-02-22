import { ISelectRoute } from "app/interfaces/IRouteSelector";
import { SelectRoute } from "../SelectRoute";
import { IModalContext } from "app/interfaces/IModal";

export const openSelectRouteModal = (
  { openModal }: IModalContext,
  { title, routes, onRouteSelected }: ISelectRoute
) => {
  openModal({
    content: <SelectRoute routes={routes} onRouteSelected={onRouteSelected} />,
    title: title ?? "",
  });
};
