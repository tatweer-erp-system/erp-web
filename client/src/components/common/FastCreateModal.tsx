import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Button, Form } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { AppModal } from "@/components/common/AppModal";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";

const fastCreateSchema = z.object({
  name: z.string().min(1, "common.name_required"),
});

type FastCreateFormValues = z.infer<typeof fastCreateSchema>;

type FastCreateModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { nameEn: string; nameAr: string }) => void;
  isLoading: boolean;
};

/**
 * Quick-create modal with a single name field.
 * Saves the entered value to both nameEn and nameAr as a placeholder.
 * The user completes the other language on the detail page.
 */
export function FastCreateModal({
  title,
  open,
  onClose,
  onSubmit,
  isLoading,
}: FastCreateModalProps) {
  const lang = useLangStore(s => s.lang);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FastCreateFormValues>({
    resolver: zodResolver(fastCreateSchema),
    defaultValues: { name: "" },
  });

  function handleFormSubmit(values: FastCreateFormValues) {
    onSubmit({ nameEn: values.name, nameAr: values.name });
  }

  function handleClose() {
    reset();
    onClose();
  }

  const { ref: nameRef, ...nameRest } = register("name");

  return (
    <AppModal title={title} open={open} onClose={handleClose} width={440}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        noValidate
        className="space-y-4"
      >
        <Form.Item
          label={t("common.name", lang)}
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message ? t(errors.name.message, lang) : undefined}
          layout="vertical"
        >
          <Input
            ref={nameRef}
            {...nameRest}
            autoFocus
            size="large"
            placeholder={t("common.name", lang)}
          />
        </Form.Item>

        <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
          <InfoCircleOutlined className="mt-0.5 text-blue-500 shrink-0" />
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {t("common.fast_create_note", lang)}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button onClick={handleClose} disabled={isLoading}>
            {t("common.cancel", lang)}
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {isLoading ? t("common.creating", lang) : t("common.create", lang)}
          </Button>
        </div>
      </form>
    </AppModal>
  );
}
