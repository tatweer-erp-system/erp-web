import { useEffect } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer, Button, Modal } from "antd";
import { ShoppingCartOutlined, FileTextOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useBreakpoint } from "@/hooks/ui/useBreakpoint";
import { usePartners } from "@/hooks/queries/usePartners";
import { useProducts } from "@/hooks/queries/useProducts";
import { useCreateSalesOrder } from "@/hooks/mutations/useSalesOrderMutations";
import { ROUTES } from "@/shared/constants/routes";
import { SalesOrderFastCreateFields } from "@/components/sales/SalesOrderFastCreateFields";

// ─── Schema ──────────────────────────────────────────────────────────────────

const salesOrderFastCreateSchema = z.object({
  partnerId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.coerce.number().min(0.001),
  unitPrice: z.coerce.number().min(0),
  salespersonId: z.string().uuid().optional(),
  notes: z.string().optional(),
  validUntil: z.string().optional(),
});

type FastCreateFormValues = z.infer<typeof salesOrderFastCreateSchema>;

const DEFAULT_VAT_RATE = 15;

// ─── Props ───────────────────────────────────────────────────────────────────

type SalesOrderFastCreateProps = {
  open: boolean;
  onClose: () => void;
  isQuotation?: boolean;
  onSuccess?: (id: string) => void;
};

/** Fast-create drawer for sales orders and quotations. */
export function SalesOrderFastCreate({
  open,
  onClose,
  isQuotation = false,
  onSuccess,
}: SalesOrderFastCreateProps) {
  const { t, lang, direction } = useTranslation();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();

  const { data: partnersData } = usePartners({
    isCustomer: true,
  } as Record<string, unknown>);
  const { data: productsData } = useProducts();
  const { mutate: createOrder, isPending } = useCreateSalesOrder();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<FastCreateFormValues>({
    resolver: zodResolver(salesOrderFastCreateSchema),
    defaultValues: { quantity: 1 },
  });

  useEffect(() => {
    if (open) {
      reset({ quantity: 1 });
    }
  }, [open, reset]);

  function handleClose() {
    if (isDirty) {
      Modal.confirm({
        title: t("common.are_you_sure", lang),
        content: t("sales.fastCreate.unsavedWarning", lang),
        onOk: () => {
          reset();
          onClose();
        },
      });
      return;
    }
    reset();
    onClose();
  }

  function submitOrder(values: FastCreateFormValues, shouldNavigate: boolean) {
    createOrder(
      {
        partnerId: values.partnerId,
        salespersonId: values.salespersonId,
        notes: values.notes,
        lines: [
          {
            productId: values.productId,
            quantity: values.quantity,
            unitPrice: values.unitPrice,
            taxRate: DEFAULT_VAT_RATE,
          },
        ],
      },
      {
        onSuccess: response => {
          const record = response?.data ?? response ?? {};
          const orderNumber = record.orderNumber ?? record.id ?? "";
          toast.success(t("sales.message.created", lang));
          reset();
          onClose();
          onSuccess?.(orderNumber);
          if (shouldNavigate && orderNumber) {
            const path = isQuotation
              ? ROUTES.quotationDetail(orderNumber)
              : ROUTES.orderDetail(orderNumber);
            navigate(path);
          }
        },
        onError: () => {
          toast.error(t("sales.message.loadFailed", lang));
        },
      }
    );
  }

  function handleSave(values: FastCreateFormValues) {
    submitOrder(values, false);
  }

  function handleSaveAndOpen(values: FastCreateFormValues) {
    submitOrder(values, true);
  }

  function handleProductSelect(productId: string) {
    const selected = (productsData?.data ?? []).find(p => p.id === productId);
    if (selected?.salePrice != null) {
      setValue("unitPrice", selected.salePrice);
    }
  }

  const title = isQuotation
    ? t("sales.quotation.newQuotation", lang)
    : t("sales.action.create", lang);

  const headerIcon = isQuotation ? (
    <FileTextOutlined />
  ) : (
    <ShoppingCartOutlined />
  );

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2 text-white">
          {headerIcon}
          <span className="font-semibold">{title}</span>
        </div>
      }
      placement={isMobile ? "bottom" : direction === "rtl" ? "left" : "right"}
      width={isMobile ? "100%" : 420}
      height={isMobile ? "90%" : undefined}
      open={open}
      onClose={handleClose}
      destroyOnClose
      keyboard
      styles={{
        header: {
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
        },
        body: { direction: direction === "rtl" ? "rtl" : "ltr" },
      }}
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button onClick={handleClose} disabled={isPending}>
            {t("common.cancel", lang)}
          </Button>
          <Button onClick={handleSubmit(handleSaveAndOpen)} loading={isPending}>
            {t("sales.fastCreate.saveAndOpen", lang)}
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit(handleSave)}
            loading={isPending}
          >
            {t("common.save", lang)}
          </Button>
        </div>
      }
    >
      <form noValidate className="space-y-4">
        <SalesOrderFastCreateFields
          control={control}
          errors={errors}
          customers={partnersData?.data ?? []}
          products={productsData?.data ?? []}
          isQuotation={isQuotation}
          onProductSelect={handleProductSelect}
        />
      </form>
    </Drawer>
  );
}
