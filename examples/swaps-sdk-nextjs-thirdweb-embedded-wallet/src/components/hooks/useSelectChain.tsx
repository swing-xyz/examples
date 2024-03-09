<<<<<<< HEAD
import { ISelectChainContext, ISelectChainProvider, ISelectedChain } from 'app/interfaces/IChainSelector';
import React, { createContext, useContext, useState, ReactNode, FC, useCallback } from 'react';

const defaultSelectChainContext: ISelectChainContext = {
    setChainAndToken: () => {},
    selectedChain: {},
    clearChainAndToken: () => {},
};

const SelectChainContext = createContext<ISelectChainContext>(defaultSelectChainContext);

export const SelectChainProvider: FC<ISelectChainProvider> = ({ children }) => {
    const [selectedChain, setSelectedChain] = useState<ISelectedChain>();

    const setChainAndToken = useCallback((chain: ISelectedChain) => setSelectedChain(chain), []);
    const clearChainAndToken = useCallback(() => setSelectedChain({}), []);

    const provider: ISelectChainContext = {
        selectedChain,
        setChainAndToken,
        clearChainAndToken,
    };

    return <SelectChainContext.Provider value={provider}>{children}</SelectChainContext.Provider>;
};

export const useSelectChain = () => {
    const contextValue = useContext<ISelectChainContext>(SelectChainContext);
    if (contextValue === null) {
        throw new Error('useSelectChain must be used within a SelectChainProvider');
    }
    return contextValue;
=======
import {
  ISelectChainContext,
  ISelectChainProvider,
  ISelectedChain,
} from "app/interfaces/IChainSelector";
import React, {
  createContext,
  useContext,
  useState,
  FC,
  useCallback,
} from "react";

const defaultSelectChainContext: ISelectChainContext = {
  setChainAndToken: () => {},
  selectedChain: {},
  clearChainAndToken: () => {},
};

const SelectChainContext = createContext<ISelectChainContext>(
  defaultSelectChainContext,
);

export const SelectChainProvider: FC<ISelectChainProvider> = ({ children }) => {
  const [selectedChain, setSelectedChain] = useState<ISelectedChain>();

  const setChainAndToken = useCallback(
    (chain: ISelectedChain) => setSelectedChain(chain),
    [],
  );
  const clearChainAndToken = useCallback(() => setSelectedChain({}), []);

  const provider: ISelectChainContext = {
    selectedChain,
    setChainAndToken,
    clearChainAndToken,
  };

  return (
    <SelectChainContext.Provider value={provider}>
      {children}
    </SelectChainContext.Provider>
  );
};

export const useSelectChain = () => {
  const contextValue = useContext<ISelectChainContext>(SelectChainContext);
  if (contextValue === null) {
    throw new Error("useSelectChain must be used within a SelectChainProvider");
  }
  return contextValue;
>>>>>>> 17ed0bedd0282c70968c091fdded49e7dbedd508
};
