<<<<<<< HEAD
import { IModalContent, IModalContext, IModalProvider } from 'app/interfaces/IModal';
import React, { createContext, useContext, useState, useCallback, FC } from 'react';

const defaultModelContent: IModalContent = {
    content: <></>,
    title: '',
};

const defaultModalContext: IModalContext = {
    isOpen: false,
    openModal: () => {},
    closeModal: () => {},
    modelContent: defaultModelContent,
=======
import {
  IModalContent,
  IModalContext,
  IModalProvider,
} from "app/interfaces/IModal";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  FC,
} from "react";

const defaultModelContent: IModalContent = {
  content: <></>,
  title: "",
};

const defaultModalContext: IModalContext = {
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
  modelContent: defaultModelContent,
>>>>>>> 17ed0bedd0282c70968c091fdded49e7dbedd508
};

const ModalContext = createContext<IModalContext>(defaultModalContext);

export const ModalProvider: FC<IModalProvider> = ({ children }) => {
<<<<<<< HEAD
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [modelContent, setModelContent] = useState<IModalContent>(defaultModelContent);

    const openModal = useCallback((content: IModalContent) => {
        setModelContent(content);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setModelContent(defaultModelContent);
    }, []);

    return <ModalContext.Provider value={{ isOpen, openModal, closeModal, modelContent }}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
    const contextValue = useContext<IModalContext>(ModalContext);
    if (contextValue === null) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return contextValue;
=======
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modelContent, setModelContent] =
    useState<IModalContent>(defaultModelContent);

  const openModal = useCallback((content: IModalContent) => {
    setModelContent(content);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModelContent(defaultModelContent);
  }, []);

  return (
    <ModalContext.Provider
      value={{ isOpen, openModal, closeModal, modelContent }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const contextValue = useContext<IModalContext>(ModalContext);
  if (contextValue === null) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return contextValue;
>>>>>>> 17ed0bedd0282c70968c091fdded49e7dbedd508
};
