import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Application modal on top of the shadcn/Radix <Dialog>: always open while
 * mounted, parents control visibility by mounting/unmounting it. Focus
 * trap, Escape and overlay-click handling come from Radix.
 */
export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[480px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
