/**
 * Customer detail page displaying partner info with tabs.
 * Follows the SalesOrderDetailPage pattern.
 * Default export for lazy loading via React.lazy().
 */

import { useState, useMemo, useCallback } from "react";

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
  Switch,
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
} from "@ant-design/icons";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCustomer } from "@/hooks/queries/usePartners";
import {
  useDeletePartner,
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
  CreatePartnerContactInput,
  UpdatePartnerContactInput,
} from "@/types/modules/partners";

export default function CustomerDetails() {
  const { t, lang, direction } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: customer, isLoading, isError } = useCustomer(id);
  const deleteMutation = useDeletePartner();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(ROUTES.customerDetail(customer.id))}
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
              children: <GeneralTab customer={customer} t={t} lang={lang} />,
            },
            {
              key: "address",
              label: t("customers.tab.address", lang),
              children: <AddressTab customer={customer} t={t} lang={lang} />,
            },
            {
              key: "accounting",
              label: t("customers.tab.accounting", lang),
              children: <AccountingTab customer={customer} t={t} lang={lang} />,
            },
            {
              key: "contacts",
              label: t("customers.tab.contacts", lang),
              children: <ContactsTab customer={customer} t={t} lang={lang} />,
            },
            {
              key: "notes",
              label: t("customers.tab.notes", lang),
              children: <NotesTab customer={customer} t={t} lang={lang} />,
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

// ── Tab type ──────────────────────────────────────────────────────────────

type TabProps = {
  customer: Partner;
  t: (k: string, l: string) => string;
  lang: "ar" | "en";
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

function GeneralTab({ customer, t, lang }: TabProps) {
  const typeLabel: Record<string, string> = {
    [PartnerType.CUSTOMER]: t("customers.type.customer", lang),
    [PartnerType.SUPPLIER]: t("customers.type.supplier", lang),
    [PartnerType.BOTH]: t("customers.type.both", lang),
    [PartnerType.INDIVIDUAL]: t("customers.type.individual", lang),
  };

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

// ── Address Tab ───────────────────────────────────────────────────────────

function AddressTab({ customer, t, lang }: TabProps) {
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

// ── Accounting Tab ────────────────────────────────────────────────────────

function AccountingTab({ customer, t, lang }: TabProps) {
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
  const [form] = Form.useForm();

  const handleOpenCreate = useCallback(() => {
    setEditingContact(null);
    form.resetFields();
    setIsModalOpen(true);
  }, [form]);

  const handleOpenEdit = useCallback(
    (contact: PartnerContact) => {
      setEditingContact(contact);
      form.setFieldsValue({
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
    [form]
  );

  const handleSubmit = useCallback(() => {
    form.validateFields().then(values => {
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
    form,
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
        <Form form={form} layout="vertical" className="mt-4">
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

function NotesTab({ customer, t, lang }: TabProps) {
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
