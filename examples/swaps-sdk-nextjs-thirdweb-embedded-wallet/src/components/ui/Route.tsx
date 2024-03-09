<<<<<<< HEAD
import { IRoute } from 'app/interfaces/IRouteSelector';
import { useCustomSwingSdk } from 'components/hooks/useSwingSDK';
import { FC, useEffect, useState } from 'react';
import { FaGasPump, FaMoneyBill, FaStopwatch } from 'react-icons/fa';
import { MdCheckCircle, MdGasMeter, MdMoney, MdOutlineTimelapse } from 'react-icons/md';

export const Route: FC<IRoute> = ({ route, onRouteSelected }) => {
    const [processedRoute, setProcessedRoute] = useState<{ name: string; logo: string }>();

    const { swingSDK } = useCustomSwingSdk();

    useEffect(() => {
        if (swingSDK.isReady) {
            setProcessedRoute(swingSDK.getIntegration(route.quote.integration));
        }
    }, [swingSDK.isReady]);
    return (
        <div
            key={route.quote.integration}
            className="mt-1 group hover:bg-slate-200 hover:rounded-md hover:cursor-pointer transition-all"
            onClick={() => onRouteSelected({ ...route, ...processedRoute })}
        >
            <div className="flex justify-between items-center">
                <div className="group flex flex-col justify-center items-start space-y-3 p-3">
                    <div className="flex">
                        {route?.isBest ? (
                            <div className="flex space-x-1 bg-green-200 font-bold rounded-full text-[9px] text-green-600 px-2 py-1">
                                <MdCheckCircle className="w-3 h-3" />
                                <span>Best</span>
                            </div>
                        ) : (
                            <></>
                        )}
                    </div>
                    <div className="flex justify-start items-start space-x-3 ">
                        <img src={processedRoute?.logo} alt={route.quote.integration} className="rounded-full w-8 h-8" />
                        <div className="flex flex-col space-y-2">
                            <h2 className="capitalize text-sm font-bold">{route.quote.integration}</h2>
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1 bg-red-200 font-bold rounded-full text-[9px] text-red-600 px-2 py-1">
                                    <FaMoneyBill className="w-3 h-3" />
                                    <span>${route.quote.amountUSD}</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-purple-200 font-bold rounded-full text-[9px] text-purple-600 px-2 py-1">
                                    <FaGasPump className="w-3 h-3" />
                                    <span>${route.gasUSD}</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-green-200 font-bold rounded-full text-[9px] text-green-600 px-2 py-1">
                                    <MdOutlineTimelapse className="w-3 h-3" />
                                    <span>~{route.duration} mins 🔥</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
=======
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
      className="mt-1 group hover:bg-slate-200 hover:rounded-md hover:cursor-pointer transition-all"
      onClick={() => onRouteSelected({ ...route, ...processedRoute })}
    >
      <div className="flex justify-between items-center">
        <div className="group flex flex-col justify-center items-start space-y-3 p-3">
          <div className="flex">
            {/* @ts-expect-error override route */}
            {route?.isBest ? (
              <div className="flex space-x-1 bg-green-200 font-bold rounded-full text-[9px] text-green-600 px-2 py-1">
                <MdCheckCircle className="w-3 h-3" />
                <span>Best</span>
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="flex justify-start items-start space-x-3 ">
            <img
              src={processedRoute?.logo}
              alt={route.quote.integration}
              className="rounded-full w-8 h-8"
            />
            <div className="flex flex-col space-y-2">
              <h2 className="capitalize text-sm font-bold">
                {route.quote.integration}
              </h2>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-red-200 font-bold rounded-full text-[9px] text-red-600 px-2 py-1">
                  <FaMoneyBill className="w-3 h-3" />
                  <span>${route.quote.amountUSD}</span>
                </div>
                <div className="flex items-center space-x-1 bg-purple-200 font-bold rounded-full text-[9px] text-purple-600 px-2 py-1">
                  <FaGasPump className="w-3 h-3" />
                  <span>${route.gasUSD}</span>
                </div>
                <div className="flex items-center space-x-1 bg-green-200 font-bold rounded-full text-[9px] text-green-600 px-2 py-1">
                  <MdOutlineTimelapse className="w-3 h-3" />
                  <span>~{route.duration} mins 🔥</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
>>>>>>> 17ed0bedd0282c70968c091fdded49e7dbedd508
};
