// src/components/dashboard/AnalysisModal.tsx
'use client';

import { Fragment } from 'react';
import { Dialog } from '@headlessui/react';
import AnalysisForm from './AnalysisForm';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (id: string | number) => void;
}

export default function AnalysisModal({ isOpen, onClose, onSuccess }: AnalysisModalProps) {
  return (
    <>
      {/* Using Dialog directly without Transition to avoid type errors */}
      <Dialog 
        open={isOpen} 
        onClose={onClose}
        className="relative z-10"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <AnalysisForm 
                onCancel={onClose}
                onSuccess={(id) => {
                  if (onSuccess) {
                    onSuccess(id);
                  }
                  onClose();
                }}
              />
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </>
  );
}