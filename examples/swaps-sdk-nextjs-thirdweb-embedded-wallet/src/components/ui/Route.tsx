import { IRoute } from "app/interfaces/IRouteSelector";
import { useCustomSwingSdk } from "components/hooks/useSwingSDK";
import { FC, useEffect, useState } from "react";
import { FaGasPump, FaMoneyBill } from "react-icons/fa";
import { MdCheckCircle, MdOutlineTimelapse } from "react-icons/md";

export const Route: FC<IRoute> = ({ route, onRouteSelected }) => {
  const [processedRoute, setProcessedRoute] = useState<{
    name: string;
    logo: string;
  }>();

  const { swingSDK } = useCustomSwingSdk();

  useEffect(() => {
    if (swingSDK?.isReady) {
      setProcessedRoute(swingSDK.getIntegration(route.quote.integration));
    }
  }, [swingSDK?.isReady]);
  return (
    <div
      key={route.quote.integration}
      className="group mt-1 transition-all hover:cursor-pointer hover:rounded-md hover:bg-slate-200"
      onClick={() => onRouteSelected({ ...route, ...processedRoute })}
    >
      <div className="flex items-center justify-between">
        <div className="group flex flex-col items-start justify-center space-y-3 p-3">
          <div className="flex">
            {/* @ts-expect-error override route */}
            {route?.isBest ? (
              <div className="flex space-x-1 rounded-full bg-green-200 px-2 py-1 text-[9px] font-bold text-green-600">
                <MdCheckCircle className="h-3 w-3" />
                <span>Best</span>
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="flex items-start justify-start space-x-3 ">
            <img
              src={processedRoute?.logo}
              alt={route.quote.integration}
              className="h-8 w-8 rounded-full"
            />
            <div className="flex flex-col space-y-2">
              <h2 className="text-sm font-bold capitalize">
                {route.quote.integration}
              </h2>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 rounded-full bg-red-200 px-2 py-1 text-[9px] font-bold text-red-600">
                  <FaMoneyBill className="h-3 w-3" />
                  <span>${route.quote.amountUSD}</span>
                </div>
                <div className="flex items-center space-x-1 rounded-full bg-purple-200 px-2 py-1 text-[9px] font-bold text-purple-600">
                  <FaGasPump className="h-3 w-3" />
                  <span>${route.gasUSD}</span>
                </div>
                <div className="flex items-center space-x-1 rounded-full bg-green-200 px-2 py-1 text-[9px] font-bold text-green-600">
                  <MdOutlineTimelapse className="h-3 w-3" />
                  <span>~{route.duration} mins 🔥</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
