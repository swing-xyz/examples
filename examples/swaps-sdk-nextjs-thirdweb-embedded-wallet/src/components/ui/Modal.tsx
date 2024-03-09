<<<<<<< HEAD
import { Dialog, Popover, Transition } from '@headlessui/react';
import { useModal } from 'components/hooks/useModal';
import { motion } from 'framer-motion';
import React, { useEffect } from 'react';
import { MdOutlineClose } from 'react-icons/md';

export const Modal: React.FC<IModal> = () => {
    const {
        isOpen,
        closeModal,
        modelContent: { title, content },
    } = useModal();

    return (
        <>
            <Transition appear show={isOpen} as={React.Fragment}>
                <Dialog as="div" className="relative z-30" onClose={() => closeModal()}>
                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25" />
                    </Transition.Child>

                    <div className="fixed inset-0">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Dialog.Overlay
                                as={motion.div}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-0 bg-gray-300/60 backdrop-blur"
                            />
                            <Transition.Child
                                as={React.Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md max-h-[60vh] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <div className="flex justify-between items-center">
                                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex-1 text-center">
                                            {title}
                                        </Dialog.Title>
                                        <MdOutlineClose
                                            className="hover:cursor-pointer hover:bg-gray-300 transition-all ease-in-out bg-gray-200 rounded-2xl w-8 h-8 p-1 flex-none"
                                            onClick={closeModal}
                                        />
                                    </div>
                                    {content}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
=======
import { Dialog, Transition } from "@headlessui/react";
import { useModal } from "components/hooks/useModal";
import { motion } from "framer-motion";
import React from "react";
import { MdOutlineClose } from "react-icons/md";

export const Modal: React.FC<IModal> = () => {
  const {
    isOpen,
    closeModal,
    modelContent: { title, content },
  } = useModal();

  return (
    <>
      <Transition appear show={isOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-30" onClose={() => closeModal()}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Overlay
                as={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-0 bg-gray-300/60 backdrop-blur"
              />
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md max-h-[60vh] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 flex-1 text-center"
                    >
                      {title}
                    </Dialog.Title>
                    <MdOutlineClose
                      className="hover:cursor-pointer hover:bg-gray-300 transition-all ease-in-out bg-gray-200 rounded-2xl w-8 h-8 p-1 flex-none"
                      onClick={closeModal}
                    />
                  </div>
                  {content}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
>>>>>>> 17ed0bedd0282c70968c091fdded49e7dbedd508
};

export interface IModal {}
