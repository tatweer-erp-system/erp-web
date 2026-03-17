import { ReactNode } from "react";
import { useForm, type DefaultValues, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import { toast } from "sonner";
import { Modal, Button } from "antd";
import type { ApiError } from "@/types/api";
import { useLangStore } from "@/stores/lang.store";
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
  const lang = useLangStore(s => s.lang);
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
    <Modal
      open={open}
      onCancel={() => {
        onOpenChange(false);
        form.reset();
      }}
      title={title}
      width={448}
      destroyOnClose
      centered
      footer={null}
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2" noValidate>
        {children(form)}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
          <Button onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
