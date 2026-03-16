import { ReactNode } from "react";
import { useForm, type DefaultValues, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ApiError } from "@/types/api";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { t } from "@/i18n";

interface FormModalProps<T extends FieldValues> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  schema: ZodType;
  defaultValues: DefaultValues<T>;
  onSubmit: (data: T) => Promise<void>;
  isLoading?: boolean;
  children: (form: ReturnType<typeof useForm<T>>) => ReactNode;
}

export function FormModal<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  schema,
  defaultValues,
  onSubmit,
  isLoading = false,
  children,
}: FormModalProps<T>) {
  const { language: lang } = useAppSettings();
  const isEdit = "id" in defaultValues && !!defaultValues.id;

  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ZodType generic variance mismatch with react-hook-form Resolver
    resolver: zodResolver(schema as any) as any,
    defaultValues,
  });

  const handleSubmit = form.handleSubmit(async data => {
    try {
      await onSubmit(data);
      toast.success(
        isEdit
          ? t("common.updated_successfully", lang)
          : t("common.created_successfully", lang)
      );
      onOpenChange(false);
      form.reset();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError?.message ?? t("common.error_occurred", lang));
    }
  });

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        onOpenChange(v);
        if (!v) form.reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {children(form)}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEdit ? "Saving..." : "Creating..."}
                </span>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
