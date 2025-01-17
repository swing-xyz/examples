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
                <Dialog.Panel className="max-h-[60vh] w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <Dialog.Title
                      as="h3"
                      className="flex-1 text-center text-lg font-medium leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                    <MdOutlineClose
                      className="h-8 w-8 flex-none rounded-2xl bg-gray-200 p-1 transition-all ease-in-out hover:cursor-pointer hover:bg-gray-300"
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
};

export interface IModal {}
