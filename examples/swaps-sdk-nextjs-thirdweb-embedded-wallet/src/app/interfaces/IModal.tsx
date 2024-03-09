<<<<<<< HEAD
import { ReactNode } from 'react';

export interface IModalProvider {
    children: ReactNode;
}

export interface IModalContext {
    isOpen: boolean;
    openModal: (content: IModalContent) => void;
    closeModal: () => void;
    modelContent: IModalContent;
}

export interface IModalContent {
    content: ReactNode;
    title: string;
=======
import { ReactNode } from "react";

export interface IModalProvider {
  children: ReactNode;
}

export interface IModalContext {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  openModal: (content: IModalContent) => void;
  closeModal: () => void;
  modelContent: IModalContent;
}

export interface IModalContent {
  content: ReactNode;
  title: string;
>>>>>>> 17ed0bedd0282c70968c091fdded49e7dbedd508
}
