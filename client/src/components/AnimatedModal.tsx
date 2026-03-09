import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  size?: "sm" | "md" | "lg";
}

export default function AnimatedModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = "Submit",
  size = "md",
}: AnimatedModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`${sizeClasses[size]} dark:bg-card bg-card dark:bg-card rounded-lg shadow-lg border border-border dark:border-border pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary rounded-lg transition-colors"
            >
              <X size={20} className="text-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            {children}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-border justify-end animate-in fade-in slide-in-from-bottom-1 duration-500 delay-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-border"
            >
              Cancel
            </Button>
            {onSubmit && (
              <Button
                onClick={onSubmit}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {submitLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
