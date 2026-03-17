import * as React from "react";
import { Modal } from "antd";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dialog composition context — preserves the IME composition tracking
 * that was used by Input and Textarea to prevent premature dialog close.
 */
const DialogCompositionContext = React.createContext<{
  isComposing: () => boolean;
  setComposing: (composing: boolean) => void;
  justEndedComposing: () => boolean;
  markCompositionEnd: () => void;
}>({
  isComposing: () => false,
  setComposing: () => {},
  justEndedComposing: () => false,
  markCompositionEnd: () => {},
});

export const useDialogComposition = () =>
  React.useContext(DialogCompositionContext);

/**
 * Dialog — renders an Ant Design Modal but exposes the same
 * open / onOpenChange API that shadcn Dialog used.
 */
type DialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

function Dialog({ open, onOpenChange, children }: DialogProps) {
  const composingRef = React.useRef(false);
  const justEndedRef = React.useRef(false);
  const endTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const contextValue = React.useMemo(
    () => ({
      isComposing: () => composingRef.current,
      setComposing: (composing: boolean) => {
        composingRef.current = composing;
      },
      justEndedComposing: () => justEndedRef.current,
      markCompositionEnd: () => {
        justEndedRef.current = true;
        if (endTimerRef.current) {
          clearTimeout(endTimerRef.current);
        }
        endTimerRef.current = setTimeout(() => {
          justEndedRef.current = false;
        }, 150);
      },
    }),
    []
  );

  // Collect DialogContent, DialogHeader, DialogFooter from children
  const contentRef = React.useRef<{
    className?: string;
    showCloseButton?: boolean;
    children?: React.ReactNode;
  }>({});

  // Parse children to find DialogContent
  let modalContent: React.ReactNode = null;
  let modalClassName = "";

  React.Children.forEach(children, child => {
    if (
      React.isValidElement(child) &&
      (child as React.ReactElement<{ "data-slot"?: string }>).props?.[
        "data-slot"
      ] === "dialog-content"
    ) {
      modalContent = (
        child as React.ReactElement<{ children?: React.ReactNode }>
      ).props.children;
      modalClassName =
        (child as React.ReactElement<{ className?: string }>).props.className ??
        "";
    }
  });

  // If no data-slot found, just render children inside modal
  if (!modalContent) {
    modalContent = children;
  }

  return (
    <DialogCompositionContext.Provider value={contextValue}>
      <Modal
        open={open}
        onCancel={() => onOpenChange?.(false)}
        footer={null}
        destroyOnClose
        centered
        closable
        className={cn("dialog-wrapper", modalClassName)}
        keyboard={!composingRef.current}
      >
        {modalContent}
      </Modal>
    </DialogCompositionContext.Provider>
  );
}

function DialogTrigger({ children, ...props }: React.ComponentProps<"button">) {
  return <button {...props}>{children}</button>;
}

function DialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function DialogClose({ children, ...props }: React.ComponentProps<"button">) {
  return <button {...props}>{children}</button>;
}

function DialogOverlay({ className, ...props }: React.ComponentProps<"div">) {
  return null;
}

/**
 * DialogContent — when rendered inside <Dialog>, its children are
 * extracted and placed into the Ant Design Modal body.
 * When rendered standalone (e.g. in a non-Dialog context), renders
 * children directly.
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
}) {
  return (
    <div data-slot="dialog-content" className={className} {...props}>
      {children}
    </div>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 mb-4", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="dialog-description"
      className={cn("text-gray-500 text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
