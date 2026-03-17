import * as React from "react";
import { Modal, Button } from "antd";
import { cn } from "@/lib/utils";

/**
 * AlertDialog — Ant Design Modal wrapper preserving the compound component API.
 *
 *   <AlertDialog open={open} onOpenChange={setOpen}>
 *     <AlertDialogContent>
 *       <AlertDialogHeader>
 *         <AlertDialogTitle>Title</AlertDialogTitle>
 *         <AlertDialogDescription>Desc</AlertDialogDescription>
 *       </AlertDialogHeader>
 *       <AlertDialogFooter>
 *         <AlertDialogCancel>Cancel</AlertDialogCancel>
 *         <AlertDialogAction onClick={fn}>Confirm</AlertDialogAction>
 *       </AlertDialogFooter>
 *     </AlertDialogContent>
 *   </AlertDialog>
 */

/* ─── Context ─────────────────────────────────────────────────────── */

type AlertDialogCtx = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const AlertDialogContext = React.createContext<AlertDialogCtx>({
  open: false,
  onOpenChange: () => {},
});

/* ─── Root ────────────────────────────────────────────────────────── */

function AlertDialog({
  open = false,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <AlertDialogContext.Provider
      value={{ open, onOpenChange: onOpenChange ?? (() => {}) }}
    >
      <Modal
        open={open}
        onCancel={() => onOpenChange?.(false)}
        footer={null}
        destroyOnClose
        centered
        closable={false}
      >
        {children}
      </Modal>
    </AlertDialogContext.Provider>
  );
}

/* ─── Trigger ─────────────────────────────────────────────────────── */

function AlertDialogTrigger(props: React.ComponentProps<"button">) {
  return <button {...props} />;
}

/* ─── Portal / Overlay (no-op with Ant Modal) ─────────────────────── */

function AlertDialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return null;
}

/* ─── Content — rendered inside the Modal body ────────────────────── */

function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

/* ─── Header ──────────────────────────────────────────────────────── */

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-start", className)}
      {...props}
    />
  );
}

/* ─── Footer ──────────────────────────────────────────────────────── */

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4",
        className
      )}
      {...props}
    />
  );
}

/* ─── Title ───────────────────────────────────────────────────────── */

function AlertDialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />;
}

/* ─── Description ─────────────────────────────────────────────────── */

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return <p className={cn("text-gray-500 text-sm", className)} {...props} />;
}

/* ─── Action button ───────────────────────────────────────────────── */

function AlertDialogAction({
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { onOpenChange } = React.useContext(AlertDialogContext);

  return (
    <Button
      type="primary"
      className={cn(className)}
      onClick={e => {
        onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
        onOpenChange(false);
      }}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </Button>
  );
}

/* ─── Cancel button ───────────────────────────────────────────────── */

function AlertDialogCancel({
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { onOpenChange } = React.useContext(AlertDialogContext);

  return (
    <Button
      className={cn(className)}
      onClick={e => {
        onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
        onOpenChange(false);
      }}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </Button>
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
