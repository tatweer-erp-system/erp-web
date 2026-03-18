/**
 * Customer detail page displaying partner info with tabs.
 * Supports inline edit mode — toggle between read-only and form inputs.
 * Default export for lazy loading via React.lazy().
 */

import { useState, useMemo, useCallback, useEffect } from "react";

import {
  Button,
  Tabs,
  Skeleton,
  Result,
  Card,
  Space,
  Descriptions,
  Tag,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCustomer } from "@/hooks/queries/usePartners";
import {
  useDeletePartner,
  useUpdatePartner,
  useCreatePartnerContact,
  useUpdatePartnerContact,
  useDeletePartnerContact,
} from "@/hooks/mutations/usePartnerMutations";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CopyableCode } from "@/components/common/CopyableCode";
import { ROUTES } from "@/shared/constants/routes";
import { getName } from "@/shared/utils/getName.util";
import { PartnerType } from "@/constants/enums";
import type {
  Partner,
  PartnerContact,
  UpdatePartnerInput,
  CreatePartnerContactInput,
  UpdatePartnerContactInput,
} from "@/types/modules/partners";

// ── Edit form state ──────────────────────────────────────────────────────

type EditFormState = {
  nameEn: string;
  nameAr: string;
  type: string;
  email: string;
  phone: string;
  mobile: string;
  website: string;
  isActive: boolean;
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  creditLimit: number;
  taxNumber: string;
  vatNumber: string;
  bankIban: string;
  bankName: string;
  notes: string;
};

function buildFormState(customer: Partner): EditFormState {
  return {
    nameEn: customer.nameEn ?? "",
    nameAr: customer.nameAr ?? "",
    type: customer.type,
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    mobile: customer.mobile ?? "",
    website: customer.website ?? "",
    isActive: customer.isActive,
    street: customer.street ?? "",
    city: customer.city ?? "",
    state: customer.state ?? "",
    country: customer.country ?? "",
    zip: customer.zip ?? "",
    creditLimit: Number(customer.creditLimit) || 0,
    taxNumber: customer.taxNumber ?? "",
    vatNumber: customer.vatNumber ?? "",
    bankIban: customer.bankIban ?? "",
    bankName: customer.bankName ?? "",
    notes: customer.notes ?? "",
  };
}

export default function CustomerDetails() {
  const { t, lang, direction } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: customer, isLoading, isError } = useCustomer(id);
  const deleteMutation = useDeletePartner();
  const updateMutation = useUpdatePartner();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditFormState>(() =>
    customer ? buildFormState(customer) : ({} as EditFormState)
  );

  // Reset form when customer data loads or changes (e.g. after save)
  useEffect(() => {
    if (customer && !isEditing) {
      setForm(buildFormState(customer));
    }
  }, [customer, isEditing]);

  const BackIcon = direction === "rtl" ? ArrowRightOutlined : ArrowLeftOutlined;

  const handleDelete = useCallback(() => {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t("customers.deleteSuccess", lang));
        navigate(ROUTES.ALL_CUSTOMERS);
      },
      onError: (err: { message?: string }) =>
        toast.error(err?.message ?? t("common.error_occurred", lang)),
    });
  }, [id, deleteMutation, t, lang, navigate]);

  const handleEdit = useCallback(() => {
    if (!customer) return;
    setForm(buildFormState(customer));
    setIsEditing(true);
  }, [customer]);

  const handleCancelEdit = useCallback(() => {
    if (customer) setForm(buildFormState(customer));
    setIsEditing(false);
  }, [customer]);

  const handleSave = useCallback(() => {
    if (!id || !customer) return;

    if (!form.nameEn.trim() && !form.nameAr.trim()) {
      toast.error(t("customers.field.nameEn", lang));
      return;
    }

    const dto: UpdatePartnerInput = {
      version: customer.version,
      nameEn: form.nameEn.trim() || form.nameAr.trim(),
      nameAr: form.nameAr.trim() || form.nameEn.trim(),
      type: form.type as PartnerType,
      email: form.email || undefined,
      phone: form.phone || undefined,
      mobile: form.mobile || undefined,
      website: form.website || undefined,
      isActive: form.isActive,
      street: form.street || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      country: form.country || undefined,
      zip: form.zip || undefined,
      creditLimit: form.creditLimit || undefined,
      taxNumber: form.taxNumber || undefined,
      vatNumber: form.vatNumber || undefined,
      bankIban: form.bankIban || undefined,
      bankName: form.bankName || undefined,
      notes: form.notes || undefined,
    };

    updateMutation.mutate(
      { id, dto },
      {
        onSuccess: () => {
          toast.success(t("customers.updateSuccess", lang));
          setIsEditing(false);
        },
        onError: (err: { message?: string }) =>
          toast.error(err?.message ?? t("common.error_occurred", lang)),
      }
    );
  }, [id, customer, form, updateMutation, t, lang]);

  const updateField = useCallback(
    <K extends keyof EditFormState>(key: K, value: EditFormState[K]) => {
      setForm(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const breadcrumbs = useMemo(
    () => [
      { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
      { label: t("customers.allCustomers", lang), href: ROUTES.ALL_CUSTOMERS },
      { label: customer ? getName(customer) : "..." },
    ],
    [t, lang, customer]
  );

  if (isLoading) {
    return (
      <DashboardLayout currentPage="" breadcrumbs={[]}>
        <div className="space-y-4">
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton.Input active block style={{ height: 48 }} />
          <Card>
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
          <Card>
            <Skeleton active paragraph={{ rows: 6 }} />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !customer) {
    return (
      <DashboardLayout currentPage="" breadcrumbs={[]}>
        <Result
          status="404"
          title="404"
          subTitle={t("customers.noCustomers", lang)}
          extra={
            <Button
              type="primary"
              onClick={() => navigate(ROUTES.ALL_CUSTOMERS)}
            >
              {t("customers.backToList", lang)}
            </Button>
          }
        />
      </DashboardLayout>
    );
  }

  const typeLabel: Record<string, string> = {
    [PartnerType.CUSTOMER]: t("customers.type.customer", lang),
    [PartnerType.SUPPLIER]: t("customers.type.supplier", lang),
    [PartnerType.BOTH]: t("customers.type.both", lang),
    [PartnerType.INDIVIDUAL]: t("customers.type.individual", lang),
  };

  return (
    <DashboardLayout currentPage={getName(customer)} breadcrumbs={breadcrumbs}>
      <div className="space-y-4">
        <PageHeader
          title={getName(customer)}
          subtitle={`${typeLabel[customer.type] ?? customer.type} ${"\u00B7"} ${dayjs(customer.createdAt).format("DD MMM YYYY")}`}
          actions={
            <Space wrap>
              <Button
                icon={<BackIcon />}
                onClick={() => navigate(ROUTES.ALL_CUSTOMERS)}
              >
                {t("customers.backToList", lang)}
              </Button>
              {isEditing ? (
                <>
                  <Button icon={<CloseOutlined />} onClick={handleCancelEdit}>
                    {t("common.cancel", lang)}
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={updateMutation.isPending}
                    onClick={handleSave}
                  >
                    {t("common.save", lang)}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                  >
                    {t("customers.editCustomer", lang)}
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    {t("customers.deleteCustomer", lang)}
                  </Button>
                </>
              )}
            </Space>
          }
        />

        {/* Info Card */}
        <CustomerInfoCard customer={customer} t={t} lang={lang} />

        {/* Tabs */}
        <Tabs
          type="line"
          defaultActiveKey="general"
          items={[
            {
              key: "general",
              label: t("customers.tab.general", lang),
              children: (
                <GeneralTab
                  customer={customer}
                  t={t}
                  lang={lang}
                  isEditing={isEditing}
                  form={form}
                  updateField={updateField}
                />
              ),
            },
            {
              key: "address",
              label: t("customers.tab.address", lang),
              children: (
                <AddressTab
                  customer={customer}
                  t={t}
                  lang={lang}
                  isEditing={isEditing}
                  form={form}
                  updateField={updateField}
                />
              ),
            },
            {
              key: "accounting",
              label: t("customers.tab.accounting", lang),
              children: (
                <AccountingTab
                  customer={customer}
                  t={t}
                  lang={lang}
                  isEditing={isEditing}
                  form={form}
                  updateField={updateField}
                />
              ),
            },
            {
              key: "contacts",
              label: t("customers.tab.contacts", lang),
              children: <ContactsTab customer={customer} t={t} lang={lang} />,
            },
            {
              key: "notes",
              label: t("customers.tab.notes", lang),
              children: (
                <NotesTab
                  customer={customer}
                  t={t}
                  lang={lang}
                  isEditing={isEditing}
                  form={form}
                  updateField={updateField}
                />
              ),
            },
          ]}
        />
      </div>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={v => !v && setIsDeleteOpen(false)}
        title={t("customers.deleteCustomer", lang)}
        description={t("customers.deleteConfirm", lang)}
        confirmLabel={t("common.delete", lang)}
        onConfirm={handleDelete}
        variant="danger"
      />
    </DashboardLayout>
  );
}

// ── Shared types ─────────────────────────────────────────────────────────

type TabProps = {
  customer: Partner;
  t: (k: string, l: string) => string;
  lang: "ar" | "en";
};

type EditableTabProps = TabProps & {
  isEditing: boolean;
  form: EditFormState;
  updateField: <K extends keyof EditFormState>(
    key: K,
    value: EditFormState[K]
  ) => void;
};

// ── Info Card ─────────────────────────────────────────────────────────────

function CustomerInfoCard({ customer, t, lang }: TabProps) {
  return (
    <Card size="small">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <UserOutlined
            style={{ fontSize: 24, color: "var(--ant-color-primary)" }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold">{getName(customer)}</span>
            <Tag color={customer.isActive ? "green" : "default"}>
              {customer.isActive
                ? t("customers.status.active", lang)
                : t("customers.status.inactive", lang)}
            </Tag>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {customer.email && (
              <span className="flex items-center gap-1">
                <MailOutlined />{" "}
                <CopyableCode value={customer.email} variant="plain" />
              </span>
            )}
            {customer.phone && (
              <span className="flex items-center gap-1">
                <PhoneOutlined />{" "}
                <CopyableCode value={customer.phone} variant="plain" />
              </span>
            )}
            {customer.city && (
              <span className="flex items-center gap-1">
                <EnvironmentOutlined /> {customer.city}
                {customer.country ? `, ${customer.country}` : ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── General Tab ───────────────────────────────────────────────────────────

function GeneralTab({
  customer,
  t,
  lang,
  isEditing,
  form,
  updateField,
}: EditableTabProps) {
  const typeLabel: Record<string, string> = {
    [PartnerType.CUSTOMER]: t("customers.type.customer", lang),
    [PartnerType.SUPPLIER]: t("customers.type.supplier", lang),
    [PartnerType.BOTH]: t("customers.type.both", lang),
    [PartnerType.INDIVIDUAL]: t("customers.type.individual", lang),
  };

  const typeOptions = [
    { label: t("customers.type.customer", lang), value: PartnerType.CUSTOMER },
    { label: t("customers.type.supplier", lang), value: PartnerType.SUPPLIER },
    { label: t("customers.type.both", lang), value: PartnerType.BOTH },
    {
      label: t("customers.type.individual", lang),
      value: PartnerType.INDIVIDUAL,
    },
  ];

  if (!isEditing) {
    return (
      <Card size="small">
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small" bordered>
          <Descriptions.Item label={t("customers.field.nameEn", lang)}>
            {customer.nameEn || "--"}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.nameAr", lang)}>
            {customer.nameAr || "--"}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.type", lang)}>
            {typeLabel[customer.type] ?? customer.type}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.email", lang)}>
            {customer.email ? (
              <CopyableCode value={customer.email} variant="plain" />
            ) : (
              "--"
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.phone", lang)}>
            {customer.phone ? (
              <CopyableCode value={customer.phone} variant="plain" />
            ) : (
              "--"
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.mobile", lang)}>
            {customer.mobile ? (
              <CopyableCode value={customer.mobile} variant="plain" />
            ) : (
              "--"
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.website", lang)}>
            {customer.website ? (
              <CopyableCode value={customer.website} variant="plain" />
            ) : (
              "--"
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.isActive", lang)}>
            <Tag color={customer.isActive ? "green" : "default"}>
              {customer.isActive
                ? t("customers.status.active", lang)
                : t("customers.status.inactive", lang)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.column.createdAt", lang)}>
            {dayjs(customer.createdAt).format("DD MMM YYYY HH:mm")}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  }

  return (
    <Card size="small">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Form.Item
          label={t("customers.field.nameEn", lang)}
          layout="vertical"
          required
          className="mb-0"
        >
          <Input
            value={form.nameEn}
            onChange={e => updateField("nameEn", e.target.value)}
            placeholder={t("customers.field.nameEn", lang)}
          />
        </Form.Item>
        <Form.Item
          label={t("customers.field.nameAr", lang)}
          layout="vertical"
          required
          className="mb-0"
        >
          <Input
            value={form.nameAr}
            onChange={e => updateField("nameAr", e.target.value)}
            placeholder={t("customers.field.nameAr", lang)}
            dir="rtl"
          />
        </Form.Item>
        <Form.Item
          label={t("customers.field.type", lang)}
          layout="vertical"
          className="mb-0"
        >
          <Select
            value={form.type}
            onChange={v => updateField("type", v)}
            options={typeOptions}
          />
        </Form.Item>
        <Form.Item
          label={t("customers.field.email", lang)}
          layout="vertical"
          className="mb-0"
        >
          <Input
            value={form.email}
            onChange={e => updateField("email", e.target.value)}
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
            value={form.phone}
            onChange={e => updateField("phone", e.target.value)}
            placeholder={t("customers.field.phone", lang)}
          />
        </Form.Item>
        <Form.Item
          label={t("customers.field.mobile", lang)}
          layout="vertical"
          className="mb-0"
        >
          <Input
            value={form.mobile}
            onChange={e => updateField("mobile", e.target.value)}
            placeholder={t("customers.field.mobile", lang)}
          />
        </Form.Item>
        <Form.Item
          label={t("customers.field.website", lang)}
          layout="vertical"
          className="mb-0"
        >
          <Input
            value={form.website}
            onChange={e => updateField("website", e.target.value)}
            placeholder={t("customers.field.website", lang)}
          />
        </Form.Item>
        <Form.Item
          label={t("customers.field.isActive", lang)}
          layout="vertical"
          className="mb-0"
        >
          <Switch
            checked={form.isActive}
            onChange={v => updateField("isActive", v)}
          />
        </Form.Item>
      </div>
    </Card>
  );
}

// ── Address Tab ───────────────────────────────────────────────────────────

function AddressTab({
  customer,
  t,
  lang,
  isEditing,
  form,
  updateField,
}: EditableTabProps) {
  if (!isEditing) {
    return (
      <Card size="small">
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small" bordered>
          <Descriptions.Item label={t("customers.field.street", lang)}>
            {customer.street || "--"}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.city", lang)}>
            {customer.city || "--"}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.state", lang)}>
            {customer.state || "--"}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.country", lang)}>
            {customer.country || "--"}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.zip", lang)}>
            {customer.zip || "--"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  }

  return (
    <Card size="small">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Form.Item
          label={t("customers.field.street", lang)}
          layout="vertical"
          className="mb-0"
        >
          <Input
            value={form.street}
            onChange={e => updateField("street", e.target.value)}
            placeholder={t("customers.field.street", lang)}
          />
        </Form.Item>
        <Form.Item
          label={t("customers.field.city", lang)}
          layout="vertical"
          className="mb-0"
        >
          <Input
            value={form.city}
            onChange={e => updateField("city", e.target.value)}
            placeholder={t("customers.field.city", lang)}
          />
        </Form.Item>
        <Form.Item
          label={t("customers.field.state", lang)}
          layout="vertical"
          className="mb-0"
        >
          <Input
            value={form.state}
            onChange={e => updateField("state", e.target.value)}
            placeholder={t("customers.field.state", lang)}
          />
        </Form.Item>
        <Form.Item
          label={t("customers.field.country", lang)}
          layout="vertical"
          className="mb-0"
        >
          <Input
            value={form.country}
            onChange={e => updateField("country", e.target.value)}
            placeholder={t("customers.field.country", lang)}
          />
        </Form.Item>
        <Form.Item
          label={t("customers.field.zip", lang)}
          layout="vertical"
          className="mb-0"
        >
          <Input
            value={form.zip}
            onChange={e => updateField("zip", e.target.value)}
            placeholder={t("customers.field.zip", lang)}
          />
        </Form.Item>
      </div>
    </Card>
  );
}

// ── Accounting Tab ────────────────────────────────────────────────────────

function AccountingTab({
  customer,
  t,
  lang,
  isEditing,
  form,
  updateField,
}: EditableTabProps) {
  if (!isEditing) {
    return (
      <Card size="small">
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small" bordered>
          <Descriptions.Item label={t("customers.field.creditLimit", lang)}>
            <span className="font-mono">
              {Number(customer.creditLimit).toLocaleString("en-SA", {
                minimumFractionDigits: 2,
              })}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.taxNumber", lang)}>
            {customer.taxNumber ? (
              <CopyableCode value={customer.taxNumber} variant="plain" />
            ) : (
              "--"
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.vatNumber", lang)}>
            {customer.vatNumber ? (
              <CopyableCode value={customer.vatNumber} variant="plain" />
            ) : (
              "--"
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.paymentTerm", lang)}>
            {customer.paymentTermId || "--"}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.pricelist", lang)}>
            {customer.pricelistId || "--"}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.fiscalPosition", lang)}>
            {customer.fiscalPositionId || "--"}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.arAccount", lang)}>
            {customer.arAccountId || "--"}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.apAccount", lang)}>
            {customer.apAccountId || "--"}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.bankIban", lang)}>
            {customer.bankIban ? (
              <CopyableCode value={customer.bankIban} variant="plain" />
            ) : (
              "--"
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("customers.field.bankName", lang)}>
            {customer.bankName || "--"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  }

  return (
    <Card size="small">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Form.Item
          label={t("customers.field.creditLimit", lang)}
          layout="vertical"
          className="mb-0"
        >
          <InputNumber
            value={form.creditLimit}
            min={0}
            precision={2}
            onChange={v => updateField("creditLimit", v ?? 0)}
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
            value={form.taxNumber}
            onChange={e => updateField("taxNumber", e.target.value)}
            placeholder={t("customers.field.taxNumber", lang)}
          />
        </Form.Item>
        <Form.Item
          label={t("customers.field.vatNumber", lang)}
          layout="vertical"
          className="mb-0"
        >
          <Input
            value={form.vatNumber}
            onChange={e => updateField("vatNumber", e.target.value)}
            placeholder={t("customers.field.vatNumber", lang)}
          />
        </Form.Item>
        <Form.Item
          label={t("customers.field.bankIban", lang)}
          layout="vertical"
          className="mb-0"
        >
          <Input
            value={form.bankIban}
            onChange={e => updateField("bankIban", e.target.value)}
            placeholder={t("customers.field.bankIban", lang)}
          />
        </Form.Item>
        <Form.Item
          label={t("customers.field.bankName", lang)}
          layout="vertical"
          className="mb-0"
        >
          <Input
            value={form.bankName}
            onChange={e => updateField("bankName", e.target.value)}
            placeholder={t("customers.field.bankName", lang)}
          />
        </Form.Item>
      </div>
    </Card>
  );
}

// ── Contacts Tab ──────────────────────────────────────────────────────────

function ContactsTab({ customer, t, lang }: TabProps) {
  const createContact = useCreatePartnerContact();
  const updateContact = useUpdatePartnerContact();
  const deleteContact = useDeletePartnerContact();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<PartnerContact | null>(
    null
  );
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const [contactForm] = Form.useForm();

  const handleOpenCreate = useCallback(() => {
    setEditingContact(null);
    contactForm.resetFields();
    setIsModalOpen(true);
  }, [contactForm]);

  const handleOpenEdit = useCallback(
    (contact: PartnerContact) => {
      setEditingContact(contact);
      contactForm.setFieldsValue({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        mobile: contact.mobile,
        position: contact.position,
        isMain: contact.isMain,
      });
      setIsModalOpen(true);
    },
    [contactForm]
  );

  const handleSubmit = useCallback(() => {
    contactForm.validateFields().then(values => {
      if (editingContact) {
        const dto: UpdatePartnerContactInput = {
          version: editingContact.version,
          ...values,
        };
        updateContact.mutate(
          { id: editingContact.id, dto, partnerId: customer.id },
          {
            onSuccess: () => {
              toast.success(t("customers.contacts.updateSuccess", lang));
              setIsModalOpen(false);
            },
            onError: () => toast.error(t("common.error_occurred", lang)),
          }
        );
      } else {
        const dto: CreatePartnerContactInput = {
          partnerId: customer.id,
          ...values,
        };
        createContact.mutate(dto, {
          onSuccess: () => {
            toast.success(t("customers.contacts.createSuccess", lang));
            setIsModalOpen(false);
          },
          onError: () => toast.error(t("common.error_occurred", lang)),
        });
      }
    });
  }, [
    contactForm,
    editingContact,
    customer.id,
    createContact,
    updateContact,
    t,
    lang,
  ]);

  const handleDeleteContact = useCallback(() => {
    if (!deleteContactId) return;
    deleteContact.mutate(
      { id: deleteContactId, partnerId: customer.id },
      {
        onSuccess: () => {
          toast.success(t("customers.contacts.deleteSuccess", lang));
          setDeleteContactId(null);
        },
        onError: () => toast.error(t("common.error_occurred", lang)),
      }
    );
  }, [deleteContactId, deleteContact, customer.id, t, lang]);

  const columns: TableColumnsType<PartnerContact> = useMemo(
    () => [
      {
        title: t("customers.contacts.firstName", lang),
        dataIndex: "firstName",
        width: 150,
        sorter: false,
      },
      {
        title: t("customers.contacts.lastName", lang),
        dataIndex: "lastName",
        width: 150,
        sorter: false,
        render: (v: string | null) => v || "--",
      },
      {
        title: t("customers.contacts.email", lang),
        dataIndex: "email",
        width: 200,
        sorter: false,
        render: (v: string | null) => v || "--",
      },
      {
        title: t("customers.contacts.phone", lang),
        dataIndex: "phone",
        width: 150,
        sorter: false,
        render: (v: string | null) => v || "--",
      },
      {
        title: t("customers.contacts.position", lang),
        dataIndex: "position",
        width: 150,
        sorter: false,
        render: (v: string | null) => v || "--",
      },
      {
        title: t("customers.contacts.isMain", lang),
        dataIndex: "isMain",
        width: 100,
        sorter: false,
        render: (v: boolean) =>
          v ? (
            <Tag color="blue">{t("customers.contacts.isMain", lang)}</Tag>
          ) : null,
      },
      {
        title: t("customers.column.actions", lang),
        align: "center" as const,
        width: 100,
        render: (_: unknown, rec: PartnerContact) => (
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={e => {
                e.stopPropagation();
                handleOpenEdit(rec);
              }}
            />
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={e => {
                e.stopPropagation();
                setDeleteContactId(rec.id);
              }}
            />
          </Space>
        ),
      },
    ],
    [t, lang, handleOpenEdit]
  );

  return (
    <>
      <Card
        size="small"
        title={t("customers.contacts.title", lang)}
        extra={
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
          >
            {t("customers.contacts.addContact", lang)}
          </Button>
        }
      >
        {customer.contacts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {t("customers.noContacts", lang)}
          </div>
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={customer.contacts}
            pagination={false}
            size="small"
            scroll={{ x: "max-content" }}
          />
        )}
      </Card>

      <Modal
        open={isModalOpen}
        title={
          editingContact
            ? t("customers.contacts.editContact", lang)
            : t("customers.contacts.addContact", lang)
        }
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={createContact.isPending || updateContact.isPending}
        okText={t("common.save", lang)}
        cancelText={t("common.cancel", lang)}
      >
        <Form form={contactForm} layout="vertical" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="firstName"
              label={t("customers.contacts.firstName", lang)}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="lastName"
              label={t("customers.contacts.lastName", lang)}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label={t("customers.contacts.email", lang)}
              rules={[{ type: "email" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="phone" label={t("customers.contacts.phone", lang)}>
              <Input />
            </Form.Item>
            <Form.Item
              name="mobile"
              label={t("customers.contacts.mobile", lang)}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="position"
              label={t("customers.contacts.position", lang)}
            >
              <Input />
            </Form.Item>
          </div>
          <Form.Item
            name="isMain"
            label={t("customers.contacts.isMain", lang)}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <ConfirmDialog
        open={!!deleteContactId}
        onOpenChange={v => !v && setDeleteContactId(null)}
        title={t("customers.contacts.deleteContact", lang)}
        description={t("customers.contacts.deleteConfirm", lang)}
        confirmLabel={t("common.delete", lang)}
        onConfirm={handleDeleteContact}
        variant="danger"
      />
    </>
  );
}

// ── Notes Tab ─────────────────────────────────────────────────────────────

function NotesTab({
  customer,
  t,
  lang,
  isEditing,
  form,
  updateField,
}: EditableTabProps) {
  if (!isEditing) {
    return (
      <Card size="small">
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label={t("customers.field.notes", lang)}>
            {customer.notes || "--"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  }

  return (
    <Card size="small">
      <Form.Item
        label={t("customers.field.notes", lang)}
        layout="vertical"
        className="mb-0"
      >
        <Input.TextArea
          value={form.notes}
          onChange={e => updateField("notes", e.target.value)}
          placeholder={t("customers.field.notes", lang)}
          rows={4}
        />
      </Form.Item>
    </Card>
  );
}
