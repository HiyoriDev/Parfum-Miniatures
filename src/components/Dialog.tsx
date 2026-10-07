"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Fenêtre modale basée sur <dialog> : focus piégé, touche Échap et clic sur le
 * fond gérés par le navigateur. Sur mobile elle s'ouvre en panneau depuis le bas.
 */
export default function Dialog({ open, onClose, title, children, className = "max-w-md" }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={`m-auto w-[calc(100%-2rem)] rounded-3xl bg-carte p-0 text-texte shadow-2xl backdrop:bg-texte/40 backdrop:backdrop-blur-sm max-md:mb-0 max-md:w-full max-md:max-w-none max-md:rounded-b-none ${className}`}
    >
      {open && (
        <div className="max-h-[85dvh] overflow-y-auto p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2 className="font-display text-3xl font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="-mt-1 -mr-2 grid size-10 shrink-0 place-items-center rounded-full text-texte-doux transition-colors hover:bg-texte/5 hover:text-texte"
            >
              <X aria-hidden size={20} />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
