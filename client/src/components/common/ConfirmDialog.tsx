import { AlertTriangle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  variant?: "danger" | "warning";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  onConfirm,
  variant = "danger",
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";
  const Icon = isDanger ? Trash2 : AlertTriangle;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
              isDanger
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-orange-100 dark:bg-orange-900/30"
            }`}
          >
            <Icon
              size={20}
              className={isDanger ? "text-destructive" : "text-orange-500"}
            />
          </div>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              isDanger
                ? "bg-destructive hover:bg-destructive/90 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
