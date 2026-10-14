"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, type ReactNode } from "react";

type TransferModalProps = {
  children: ReactNode;
};

export function TransferModal({ children }: TransferModalProps) {
  const router = useRouter();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const isClosingRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    isClosingRef.current = false;

    if (dialog && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus();
    }

    return () => {
      isClosingRef.current = true;
      if (dialog?.open) dialog.close();
      if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus();
    };
  }, []);

  function dismiss() {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    router.back();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60"
    >
      <div className="border-b border-slate-200 px-5 py-4 sm:px-7">
        <div className="flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-xl font-semibold tracking-tight sm:text-2xl">
            Transfer money
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={dismiss}
            aria-label="Close transfer dialog"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Close
          </button>
        </div>
      </div>
      <div className="px-5 py-6 sm:px-7">{children}</div>
    </dialog>
  );
}
