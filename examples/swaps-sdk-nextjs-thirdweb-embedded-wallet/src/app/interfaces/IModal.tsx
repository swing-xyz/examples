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
}
