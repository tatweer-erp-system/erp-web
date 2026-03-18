/**
 * Customer create page.
 * Follows the SalesOrderCreatePage pattern with vertical form layout.
 * Default export for lazy loading via React.lazy().
 */

import { useState, useCallback } from "react";

import {
  Button,
  Card,
  Space,
  Form,
  Select,
  Input,
  InputNumber,
  Switch,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCreatePartner } from "@/hooks/mutations/usePartnerMutations";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { ROUTES } from "@/shared/constants/routes";
import { PartnerType } from "@/constants/enums";

export default function CustomerCreatePage() {
  const { t, lang, direction } = useTranslation();
  const navigate = useNavigate();
  const BackIcon = direction === "rtl" ? ArrowRightOutlined : ArrowLeftOutlined;

  const { mutate: createPartner, isPending } = useCreatePartner();

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [type, setType] = useState<string>(PartnerType.CUSTOMER);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [creditLimit, setCreditLimit] = useState<number>(0);
  const [taxNumber, setTaxNumber] = useState("");
  const [isActive, setIsActive] = useState(true);

  const typeOptions = [
    { label: t("customers.type.customer", lang), value: PartnerType.CUSTOMER },
    { label: t("customers.type.supplier", lang), value: PartnerType.SUPPLIER },
    { label: t("customers.type.both", lang), value: PartnerType.BOTH },
    {
      label: t("customers.type.individual", lang),
      value: PartnerType.INDIVIDUAL,
    },
  ];

  const handleSubmit = useCallback(() => {
    const currentLangName = lang === "ar" ? nameAr : nameEn;
    if (!currentLangName.trim()) {
      toast.error(t("customers.field.nameEn", lang));
      return;
    }

    // Fast-create: copy entered value to both columns as placeholder
    const resolvedNameEn = nameEn.trim() || nameAr.trim();
    const resolvedNameAr = nameAr.trim() || nameEn.trim();

    createPartner(
      {
        nameEn: resolvedNameEn,
        nameAr: resolvedNameAr,
        type: type as PartnerType,
        email: email || undefined,
        phone: phone || undefined,
        mobile: mobile || undefined,
        street: street || undefined,
        city: city || undefined,
        country: country || undefined,
        creditLimit: creditLimit || undefined,
        taxNumber: taxNumber || undefined,
        isActive,
      },
      {
        onSuccess: response => {
          const record = response?.data ?? response ?? {};
          const partnerId = (record as { id?: string }).id ?? "";
          toast.success(t("customers.createSuccess", lang));
          navigate(ROUTES.customerDetail(partnerId));
        },
        onError: () => toast.error(t("common.error_occurred", lang)),
      }
    );
  }, [
    nameEn,
    nameAr,
    type,
    email,
    phone,
    mobile,
    street,
    city,
    country,
    creditLimit,
    taxNumber,
    isActive,
    createPartner,
    navigate,
    t,
    lang,
  ]);

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("customers.allCustomers", lang), href: ROUTES.ALL_CUSTOMERS },
    { label: t("customers.addCustomer", lang) },
  ];

  return (
    <DashboardLayout
      currentPage={t("customers.addCustomer", lang)}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-4">
        <PageHeader
          title={t("customers.addCustomer", lang)}
          actions={
            <Space>
              <Button
                icon={<BackIcon />}
                onClick={() => navigate(ROUTES.ALL_CUSTOMERS)}
              >
                {t("customers.backToList", lang)}
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={isPending}
                onClick={handleSubmit}
              >
                {t("common.save", lang)}
              </Button>
            </Space>
          }
        />

        {/* Basic Info */}
        <Card size="small" title={t("customers.tab.general", lang)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Form.Item
              label={t("customers.field.nameEn", lang)}
              layout="vertical"
              required
              className="mb-0"
            >
              <Input
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                placeholder={t("customers.field.nameEn", lang)}
              />
            </Form.Item>
            <Form.Item
              label={t("customers.field.nameAr", lang)}
              layout="vertical"
              className="mb-0"
            >
              <Input
                value={nameAr}
                onChange={e => setNameAr(e.target.value)}
                placeholder={t("customers.field.nameAr", lang)}
                dir="rtl"
              />
            </Form.Item>
            <Form.Item
              label={t("customers.field.type", lang)}
              layout="vertical"
              className="mb-0"
            >
              <Select value={type} onChange={setType} options={typeOptions} />
            </Form.Item>
            <Form.Item
              label={t("customers.field.email", lang)}
              layout="vertical"
              className="mb-0"
            >
              <Input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t("customers.field.email", lang)}
                type="email"
              />
            </Form.Item>
            <Form.Item
              label={t("customers.field.phone", lang)}
              layout="vertical"
              className="mb-0"
            >
              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={t("customers.field.phone", lang)}
              />
            </Form.Item>
            <Form.Item
              label={t("customers.field.mobile", lang)}
              layout="vertical"
              className="mb-0"
            >
              <Input
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder={t("customers.field.mobile", lang)}
              />
            </Form.Item>
          </div>
        </Card>

        {/* Address */}
        <Card size="small" title={t("customers.tab.address", lang)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Form.Item
              label={t("customers.field.street", lang)}
              layout="vertical"
              className="mb-0"
            >
              <Input
                value={street}
                onChange={e => setStreet(e.target.value)}
                placeholder={t("customers.field.street", lang)}
              />
            </Form.Item>
            <Form.Item
              label={t("customers.field.city", lang)}
              layout="vertical"
              className="mb-0"
            >
              <Input
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder={t("customers.field.city", lang)}
              />
            </Form.Item>
            <Form.Item
              label={t("customers.field.country", lang)}
              layout="vertical"
              className="mb-0"
            >
              <Input
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder={t("customers.field.country", lang)}
              />
            </Form.Item>
          </div>
        </Card>

        {/* Accounting */}
        <Card size="small" title={t("customers.tab.accounting", lang)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Form.Item
              label={t("customers.field.creditLimit", lang)}
              layout="vertical"
              className="mb-0"
            >
              <InputNumber
                value={creditLimit}
                min={0}
                precision={2}
                onChange={v => setCreditLimit(v ?? 0)}
                style={{ width: "100%" }}
                placeholder={t("customers.field.creditLimit", lang)}
              />
            </Form.Item>
            <Form.Item
              label={t("customers.field.taxNumber", lang)}
              layout="vertical"
              className="mb-0"
            >
              <Input
                value={taxNumber}
                onChange={e => setTaxNumber(e.target.value)}
                placeholder={t("customers.field.taxNumber", lang)}
              />
            </Form.Item>
            <Form.Item
              label={t("customers.field.isActive", lang)}
              layout="vertical"
              className="mb-0"
            >
              <Switch checked={isActive} onChange={setIsActive} />
            </Form.Item>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
