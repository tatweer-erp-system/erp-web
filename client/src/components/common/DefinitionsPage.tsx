/**
 * Generic Definitions Page
 * Reusable CRUD tab-page for all module "Definitions / التعريفات" pages.
 *
 * Layout is controlled globally via AppSettingsContext:
 *   definitionsLayout:   "leftnav" (Settings-style left-nav card) | "tabs" (Antd Tabs)
 *   definitionsCrudStyle: "drawer" (slide-in drawer) | "modal" (compact 2-col modal)
 *
 * formDesign prop (still respected when crudStyle === "modal"):
 *   1 = "Two-Column Grid Modal"
 *   3 = "Sectioned Modal"
 */
import React, { useState, useMemo, useCallback } from "react";
import {
  Table,
  Modal,
  Drawer,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Tag,
  Card,
  InputNumber,
  DatePicker,
  TimePicker,
  Popconfirm,
  Typography,
  theme as antTheme,
  message,
  Tooltip,
  Divider,
  Pagination,
  Grid,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UnorderedListOutlined,
  SaveOutlined,
  CloseOutlined,
  StopOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EntityRecord {
  id: string;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
  [key: string]: any;
}

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "switch"
  | "number"
  | "color"
  | "date"
  | "time";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
  options?: Array<{ value: string | number | boolean; label: string }>;
  required?: boolean;
  min?: number;
  max?: number;
  defaultValue?: any;
  fullWidth?: boolean;
}

export interface ColDef {
  key: string;
  title: string;
  width?: number;
  render?: (val: any, record: EntityRecord) => React.ReactNode;
}

export interface TabDef {
  key: string;
  label: string;
  labelAr: string;
  fields: FieldDef[];
  columns: ColDef[];
  initialData: EntityRecord[];
  /** When set, renders this node instead of the default DefinitionsTab table */
  customContent?: React.ReactNode;
}

export interface DefinitionsPageProps {
  moduleName: string;
  moduleNameAr: string;
  tabs: TabDef[];
  /** Fallback modal design when crudStyle === "modal". 1=2-col grid, 3=sectioned. Default: 1 */
  formDesign?: 1 | 3;
}

// ─── Shared field renderer ────────────────────────────────────────────────────

function renderField(field: FieldDef) {
  switch (field.type) {
    case "textarea":
      return (
        <Input.TextArea
          rows={3}
          placeholder={field.label}
          dir={field.key === "nameAr" ? "rtl" : undefined}
        />
      );
    case "select":
      return (
        <Select
          placeholder={`Select ${field.label}`}
          options={field.options}
          allowClear
          style={{ width: "100%" }}
        />
      );
    case "switch":
      return <Switch />;
    case "number":
      return (
        <InputNumber
          style={{ width: "100%" }}
          min={field.min}
          max={field.max}
        />
      );
    case "date":
      return <DatePicker style={{ width: "100%" }} />;
    case "time":
      return <TimePicker style={{ width: "100%" }} format="HH:mm" />;
    case "color":
      return (
        <input
          type="color"
          style={{
            width: 48,
            height: 34,
            padding: 2,
            borderRadius: 6,
            border: "1px solid #d9d9d9",
            cursor: "pointer",
          }}
        />
      );
    default:
      return (
        <Input
          placeholder={field.label}
          dir={field.key === "nameAr" ? "rtl" : undefined}
        />
      );
  }
}

// ─── Drawer CRUD Form ─────────────────────────────────────────────────────────

function DrawerForm({
  open,
  onClose,
  onSave,
  fields,
  form,
  submitting,
  isEdit,
  entityLabel,
  isRTL,
  isMobile,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  fields: FieldDef[];
  form: ReturnType<typeof Form.useForm>[0];
  submitting: boolean;
  isEdit: boolean;
  entityLabel: string;
  isRTL: boolean;
  isMobile: boolean;
}) {
  const { token } = antTheme.useToken();
  const initials = entityLabel
    .split(" ")
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement={isRTL ? "left" : "right"}
      width={isMobile ? "100%" : 460}
      styles={{
        body: {
          padding: 0,
          background: token.colorBgLayout,
          display: "flex",
          flexDirection: "column",
        },
        mask: { backdropFilter: "blur(2px)", background: "rgba(0,0,0,0.35)" },
      }}
      title={null}
      closable={false}
      destroyOnClose
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        {/* gradient bg */}
        <div
          style={{
            background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive ?? token.colorPrimary}dd 100%)`,
            padding: "22px 24px 60px",
          }}
        >
          {/* top bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.18)",
                borderRadius: 6,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {isEdit
                ? isRTL
                  ? "تعديل"
                  : "Edit Mode"
                : isRTL
                  ? "إضافة"
                  : "New Record"}
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "rgba(255,255,255,0.18)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 13,
                transition: "background 0.15s",
              }}
            >
              <CloseOutlined />
            </button>
          </div>
          {/* entity info */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(255,255,255,0.22)",
                border: "2px solid rgba(255,255,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                fontWeight: 800,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {isEdit ? <EditOutlined /> : initials}
            </div>
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                {isEdit
                  ? isRTL
                    ? "تعديل السجل"
                    : "Edit Record"
                  : isRTL
                    ? "إضافة جديد"
                    : "Add New"}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.72)",
                  marginTop: 3,
                }}
              >
                {entityLabel} &nbsp;·&nbsp; {fields.length + 1}{" "}
                {isRTL ? "حقل" : "fields"}
              </div>
            </div>
          </div>
        </div>
        {/* curved bottom mask */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 28,
            background: token.colorBgLayout,
            borderRadius: "24px 24px 0 0",
          }}
        />
      </div>

      {/* ── Scrollable form body ────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 20px 20px" }}>
        <Form
          form={form}
          layout="vertical"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          {fields.map((field, idx) => (
            <div
              key={field.key}
              style={{
                background: token.colorBgContainer,
                borderRadius: 10,
                padding: "14px 16px 4px",
                marginBottom: 10,
                border: `1px solid ${token.colorBorderSecondary}`,
                boxShadow: `0 1px 3px rgba(0,0,0,0.04)`,
              }}
            >
              <Form.Item
                name={field.key}
                label={
                  <div
                    style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: token.colorText,
                        letterSpacing: "0.01em",
                      }}
                    >
                      {field.label}
                    </span>
                    {field.required !== false && field.type !== "switch" && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: token.colorError,
                          background: `${token.colorError}14`,
                          borderRadius: 4,
                          padding: "1px 5px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {isRTL ? "مطلوب" : "req"}
                      </span>
                    )}
                    {field.hint && (
                      <span
                        style={{
                          fontSize: 11,
                          color: token.colorTextTertiary,
                          fontWeight: 400,
                        }}
                      >
                        — {field.hint}
                      </span>
                    )}
                  </div>
                }
                rules={
                  field.required !== false && field.type !== "switch"
                    ? [
                        {
                          required: true,
                          message: `${field.label} is required`,
                        },
                      ]
                    : []
                }
                valuePropName={field.type === "switch" ? "checked" : "value"}
                style={{ marginBottom: 14 }}
              >
                {renderField(field)}
              </Form.Item>
            </div>
          ))}

          {/* Status card */}
          <div
            style={{
              background: token.colorBgContainer,
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 4,
              border: `1px solid ${token.colorBorderSecondary}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: `0 1px 3px rgba(0,0,0,0.04)`,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 2,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#10B981",
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: token.colorText,
                  }}
                >
                  {isRTL ? "نشط" : "Active Status"}
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: token.colorTextSecondary,
                  paddingInlineStart: 16,
                }}
              >
                {isRTL
                  ? "تفعيل أو إلغاء تفعيل هذا السجل"
                  : "Toggle to enable or disable this record"}
              </div>
            </div>
            <Form.Item
              name="isActive"
              valuePropName="checked"
              style={{ margin: 0 }}
            >
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </div>

      {/* ── Sticky footer ───────────────────────────────────────────────── */}
      <div
        style={{
          background: token.colorBgContainer,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          padding: "14px 20px",
          display: "flex",
          gap: 10,
          flexShrink: 0,
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={submitting}
          onClick={onSave}
          size="large"
          style={{
            flex: 1,
            height: 42,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive ?? token.colorPrimary})`,
            border: "none",
            boxShadow: `0 4px 12px ${token.colorPrimary}44`,
          }}
        >
          {isRTL ? "حفظ التغييرات" : "Save Changes"}
        </Button>
        <Button
          icon={<CloseOutlined />}
          onClick={onClose}
          size="large"
          style={{ height: 42, fontWeight: 600, minWidth: 100 }}
        >
          {isRTL ? "إلغاء" : "Cancel"}
        </Button>
      </div>
    </Drawer>
  );
}

// ─── Modal CRUD Form ─────────────────────────────────────────────────────────

function ModalForm({
  open,
  onClose,
  onSave,
  fields,
  form,
  submitting,
  isEdit,
  entityLabel,
  isRTL,
  sectioned,
  isMobile,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  fields: FieldDef[];
  form: ReturnType<typeof Form.useForm>[0];
  submitting: boolean;
  isEdit: boolean;
  entityLabel: string;
  isRTL: boolean;
  sectioned: boolean;
  isMobile: boolean;
}) {
  const { token } = antTheme.useToken();

  const normalFields = fields.filter(
    f => !["switch", "textarea"].includes(f.type) && !f.fullWidth
  );
  const wideFields = fields.filter(
    f => ["switch", "textarea"].includes(f.type) || f.fullWidth
  );
  const nameFields = fields.filter(
    f => f.key === "nameEn" || f.key === "nameAr"
  );
  const detailFields = fields.filter(
    f => f.key !== "nameEn" && f.key !== "nameAr"
  );

  // Shared field item renderer with card wrapper
  const FieldCard = ({
    field,
    fullWidth = false,
  }: {
    field: FieldDef;
    fullWidth?: boolean;
  }) => (
    <Form.Item
      name={field.key}
      label={
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{ fontSize: 12, fontWeight: 700, color: token.colorText }}
          >
            {field.label}
          </span>
          {field.required !== false && field.type !== "switch" && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: token.colorError,
                background: `${token.colorError}12`,
                borderRadius: 4,
                padding: "1px 5px",
                textTransform: "uppercase" as const,
                letterSpacing: "0.04em",
              }}
            >
              {isRTL ? "مطلوب" : "req"}
            </span>
          )}
          {field.hint && (
            <span
              style={{
                fontSize: 11,
                color: token.colorTextTertiary,
                fontWeight: 400,
              }}
            >
              — {field.hint}
            </span>
          )}
        </div>
      }
      rules={
        field.required !== false && field.type !== "switch"
          ? [{ required: true, message: `${field.label} is required` }]
          : []
      }
      valuePropName={field.type === "switch" ? "checked" : "value"}
      style={{ marginBottom: 0 }}
    >
      {renderField(field)}
    </Form.Item>
  );

  const SectionLabel = ({
    label,
    color,
    num,
  }: {
    label: string;
    color: string;
    num: number;
  }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background: color,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {num}
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color,
          textTransform: "uppercase" as const,
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: `${color}30` }} />
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={null}
      width={isMobile ? "95vw" : sectioned ? 700 : 640}
      destroyOnClose
      styles={{
        content: {
          padding: 0,
          overflow: "hidden",
          borderRadius: token.borderRadiusLG,
        },
        mask: { backdropFilter: "blur(2px)", background: "rgba(0,0,0,0.4)" },
      }}
    >
      {/* ── Gradient header ──────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive ?? token.colorPrimary}cc 100%)`,
            padding: "20px 24px 52px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.2)",
                  border: "2px solid rgba(255,255,255,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: "#fff",
                }}
              >
                {isEdit ? <EditOutlined /> : <PlusOutlined />}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#fff",
                    lineHeight: 1.2,
                  }}
                >
                  {isEdit
                    ? isRTL
                      ? "تعديل السجل"
                      : "Edit Record"
                    : isRTL
                      ? `إضافة ${entityLabel}`
                      : `Add ${entityLabel}`}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                    marginTop: 3,
                  }}
                >
                  {entityLabel} &nbsp;·&nbsp; {fields.length + 1}{" "}
                  {isRTL ? "حقل" : "fields"}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "rgba(255,255,255,0.18)",
                border: "none",
                cursor: "pointer",
                color: "#fff",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloseOutlined />
            </button>
          </div>
        </div>
        {/* curved bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 28,
            background: token.colorBgLayout,
            borderRadius: "20px 20px 0 0",
          }}
        />
      </div>

      {/* ── Form body ────────────────────────────────────────────────── */}
      <div
        style={{
          background: token.colorBgLayout,
          padding: "8px 24px 20px",
          maxHeight: "60vh",
          overflowY: "auto",
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          {sectioned ? (
            <>
              {/* Section 1 — Core Info */}
              <div
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: 12,
                  padding: "16px 18px",
                  marginBottom: 12,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <SectionLabel
                  num={1}
                  label={isRTL ? "المعلومات الأساسية" : "Core Information"}
                  color={token.colorPrimary}
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "0 18px",
                  }}
                >
                  {nameFields.map(field => (
                    <FieldCard key={field.key} field={field} />
                  ))}
                </div>
              </div>

              {/* Section 2 — Details */}
              {detailFields.length > 0 && (
                <div
                  style={{
                    background: token.colorBgContainer,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: 12,
                    padding: "16px 18px",
                    marginBottom: 12,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <SectionLabel
                    num={2}
                    label={isRTL ? "التفاصيل" : "Details"}
                    color="#7C3AED"
                  />
                  {detailFields.map(field => (
                    <div key={field.key} style={{ marginBottom: 14 }}>
                      <FieldCard field={field} />
                    </div>
                  ))}
                </div>
              )}

              {/* Section 3 — Status */}
              <div
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: 12,
                  padding: "16px 18px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <SectionLabel
                  num={3}
                  label={isRTL ? "الحالة" : "Status"}
                  color="#10B981"
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {isRTL ? "نشط" : "Active"}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: token.colorTextSecondary,
                        marginTop: 2,
                      }}
                    >
                      {isRTL
                        ? "تحديد ما إذا كان هذا السجل مفعلاً"
                        : "Toggle to enable or disable this record"}
                    </div>
                  </div>
                  <Form.Item
                    name="isActive"
                    valuePropName="checked"
                    style={{ margin: 0 }}
                  >
                    <Switch />
                  </Form.Item>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Main fields card */}
              <div
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: 12,
                  padding: "16px 18px",
                  marginBottom: 12,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                    gap: "0 18px",
                  }}
                >
                  {normalFields.map(field => (
                    <div key={field.key} style={{ marginBottom: 14 }}>
                      <FieldCard field={field} />
                    </div>
                  ))}
                </div>
                {wideFields.map(field => (
                  <div key={field.key} style={{ marginBottom: 14 }}>
                    <FieldCard field={field} fullWidth />
                  </div>
                ))}
              </div>

              {/* Status card */}
              <div
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: 12,
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#10B981",
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {isRTL ? "نشط" : "Active Status"}
                    </div>
                    <div
                      style={{ fontSize: 11, color: token.colorTextSecondary }}
                    >
                      {isRTL
                        ? "تفعيل أو إلغاء تفعيل هذا السجل"
                        : "Enable or disable this record"}
                    </div>
                  </div>
                </div>
                <Form.Item
                  name="isActive"
                  valuePropName="checked"
                  style={{ margin: 0 }}
                >
                  <Switch />
                </Form.Item>
              </div>
            </>
          )}
        </Form>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div
        style={{
          background: token.colorBgContainer,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        {/* In RTL: Save (right) → Cancel → required text (left, auto margin pushes it away) */}
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={submitting}
          onClick={onSave}
          style={{
            fontWeight: 700,
            minWidth: 110,
            background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimaryActive ?? token.colorPrimary})`,
            border: "none",
            boxShadow: `0 4px 12px ${token.colorPrimary}44`,
          }}
        >
          {isRTL ? "حفظ" : "Save Record"}
        </Button>
        <Button onClick={onClose} style={{ fontWeight: 600, minWidth: 90 }}>
          {isRTL ? "إلغاء" : "Cancel"}
        </Button>
        <Text
          style={{
            fontSize: 11,
            color: token.colorTextTertiary,
            marginInlineStart: "auto",
          }}
        >
          {isRTL ? "* الحقول المطلوبة" : "* Required fields"}
        </Text>
      </div>
    </Modal>
  );
}

// ─── Single Tab CRUD ──────────────────────────────────────────────────────────

function DefinitionsTab({
  tab,
  isRTL,
  formDesign,
  isMobile,
}: {
  tab: TabDef;
  isRTL: boolean;
  formDesign: 1 | 3;
  isMobile: boolean;
}) {
  const { token } = antTheme.useToken();
  const { definitionsCrudStyle } = useAppSettings();

  const [data, setData] = useState<EntityRecord[]>(tab.initialData);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<EntityRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return data;
    return data.filter(
      r =>
        r.nameEn?.toLowerCase().includes(q) ||
        r.nameAr?.toLowerCase().includes(q) ||
        Object.values(r).some(
          v => typeof v === "string" && v.toLowerCase().includes(q)
        )
    );
  }, [data, search]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  );

  const openAdd = useCallback(() => {
    setEditRecord(null);
    form.resetFields();
    tab.fields.forEach(f => {
      if (f.defaultValue !== undefined)
        form.setFieldValue(f.key, f.defaultValue);
    });
    form.setFieldValue("isActive", true);
    setFormOpen(true);
  }, [form, tab.fields]);

  const openEdit = useCallback(
    (record: EntityRecord) => {
      setEditRecord(record);
      const values: Record<string, any> = { ...record };
      tab.fields.forEach(f => {
        if (f.type === "date" && values[f.key])
          values[f.key] = dayjs(values[f.key]);
        if (f.type === "time" && values[f.key])
          values[f.key] = dayjs(values[f.key], "HH:mm");
      });
      form.setFieldsValue(values);
      setFormOpen(true);
    },
    [form, tab.fields]
  );

  const handleClose = useCallback(() => {
    setFormOpen(false);
    setEditRecord(null);
    form.resetFields();
  }, [form]);

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await new Promise(r => setTimeout(r, 350));

      tab.fields.forEach(f => {
        if ((f.type === "date" || f.type === "time") && values[f.key]?.format) {
          values[f.key] =
            f.type === "date"
              ? values[f.key].format("YYYY-MM-DD")
              : values[f.key].format("HH:mm");
        }
      });

      if (editRecord) {
        setData(prev =>
          prev.map(r => (r.id === editRecord.id ? { ...r, ...values } : r))
        );
        message.success(isRTL ? "تم التحديث بنجاح" : "Updated successfully");
      } else {
        setData(prev => [
          { ...values, id: `${tab.key}-${Date.now()}` },
          ...prev,
        ]);
        message.success(isRTL ? "تمت الإضافة بنجاح" : "Added successfully");
      }
      handleClose();
    } catch {
      message.error(
        isRTL
          ? "يرجى ملء جميع الحقول المطلوبة"
          : "Please fill all required fields"
      );
    } finally {
      setSubmitting(false);
    }
  }, [editRecord, form, handleClose, isRTL, tab.fields, tab.key]);

  const handleToggleActive = useCallback(
    (record: EntityRecord) => {
      const next = !record.isActive;
      setData(prev =>
        prev.map(r => (r.id === record.id ? { ...r, isActive: next } : r))
      );
      message.success(
        next
          ? isRTL
            ? "تم التفعيل"
            : "Activated successfully"
          : isRTL
            ? "تم إلغاء التفعيل"
            : "Deactivated successfully"
      );
    },
    [isRTL]
  );

  const handleDelete = useCallback(
    (record: EntityRecord) => {
      setData(prev => prev.filter(r => r.id !== record.id));
      message.success(isRTL ? "تم الحذف بنجاح" : "Deleted successfully");
    },
    [isRTL]
  );

  const tableColumns: ColumnsType<EntityRecord> = [
    ...tab.columns.map(col => ({
      key: col.key,
      dataIndex: col.key,
      title: col.title,
      width: col.width,
      ellipsis: true,
      render: col.render
        ? (val: any, record: EntityRecord) => col.render!(val, record)
        : undefined,
    })),
    {
      key: "isActive",
      dataIndex: "isActive",
      title: isRTL ? "الحالة" : "Status",
      width: 100,
      render: (val: boolean) =>
        val ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            {isRTL ? "نشط" : "Active"}
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">
            {isRTL ? "غير نشط" : "Inactive"}
          </Tag>
        ),
    },
    {
      key: "actions",
      title: isRTL ? "إجراءات" : "Actions",
      width: 120,
      fixed: (isRTL ? "left" : "right") as "left" | "right",
      render: (_: any, record: EntityRecord) => (
        <Space size={2}>
          {/* Edit */}
          <Tooltip title={isRTL ? "تعديل" : "Edit"}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>

          {/* Toggle Active / Inactive */}
          <Popconfirm
            title={
              record.isActive
                ? isRTL
                  ? "هل تريد إلغاء تفعيل هذا السجل؟"
                  : "Deactivate this record?"
                : isRTL
                  ? "هل تريد تفعيل هذا السجل؟"
                  : "Activate this record?"
            }
            okText={isRTL ? "نعم" : "Yes"}
            cancelText={isRTL ? "لا" : "No"}
            okButtonProps={{ danger: record.isActive, type: "primary" }}
            onConfirm={() => handleToggleActive(record)}
          >
            <Tooltip
              title={
                record.isActive
                  ? isRTL
                    ? "إلغاء التفعيل"
                    : "Deactivate"
                  : isRTL
                    ? "تفعيل"
                    : "Activate"
              }
            >
              <Button
                type="text"
                size="small"
                icon={
                  record.isActive ? <StopOutlined /> : <CheckCircleOutlined />
                }
                style={{
                  color: record.isActive
                    ? token.colorWarning
                    : token.colorSuccess,
                }}
              />
            </Tooltip>
          </Popconfirm>

          {/* Delete */}
          <Popconfirm
            title={
              isRTL
                ? "حذف هذا السجل نهائياً؟"
                : "Permanently delete this record?"
            }
            okText={isRTL ? "حذف" : "Delete"}
            cancelText={isRTL ? "إلغاء" : "Cancel"}
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record)}
          >
            <Tooltip title={isRTL ? "حذف" : "Delete"}>
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const sharedFormProps = {
    open: formOpen,
    onClose: handleClose,
    onSave: handleSave,
    fields: tab.fields,
    form,
    submitting,
    isEdit: !!editRecord,
    entityLabel: isRTL ? tab.labelAr : tab.label,
    isRTL,
    isMobile,
  };

  return (
    <div>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Input
          prefix={
            <SearchOutlined style={{ color: token.colorTextQuaternary }} />
          }
          placeholder={isRTL ? "بحث..." : "Search..."}
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          allowClear
          style={{ width: isMobile ? "100%" : 280 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          {isRTL ? "إضافة" : "Add"}
        </Button>
      </div>

      {/* Table */}
      <Table<EntityRecord>
        dataSource={paginated}
        columns={tableColumns}
        rowKey="id"
        size="small"
        pagination={false}
        rowClassName={record => (!record.isActive ? "opacity-50" : "")}
      />

      {/* ── Pagination Bar ─────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 14,
            paddingTop: 14,
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            direction: isRTL ? "rtl" : "ltr",
          }}
        >
          {/* Record count badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: token.colorFillAlter,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: 20,
                padding: "3px 10px 3px 6px",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: token.colorPrimary,
                  flexShrink: 0,
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: token.colorTextSecondary,
                  lineHeight: 1,
                }}
              >
                {isRTL
                  ? `${Math.min((page - 1) * pageSize + 1, filtered.length)}–${Math.min(page * pageSize, filtered.length)} من ${filtered.length} سجل`
                  : `${Math.min((page - 1) * pageSize + 1, filtered.length)}–${Math.min(page * pageSize, filtered.length)} of ${filtered.length} records`}
              </Text>
            </div>
          </div>

          {/* Antd Pagination */}
          <Pagination
            current={page}
            pageSize={pageSize}
            total={filtered.length}
            showSizeChanger
            onChange={(p, ps) => {
              setPage(p);
              setPageSize(ps);
            }}
            pageSizeOptions={["10", "20", "50"]}
            size="small"
          />
        </div>
      )}

      {/* CRUD Form — driven by global definitionsCrudStyle */}
      {definitionsCrudStyle === "drawer" ? (
        <DrawerForm {...sharedFormProps} />
      ) : (
        <ModalForm {...sharedFormProps} sectioned={formDesign === 3} />
      )}
    </div>
  );
}

// ─── Definitions Page ─────────────────────────────────────────────────────────

export function DefinitionsPage({
  moduleName,
  moduleNameAr,
  tabs,
  formDesign = 1,
}: DefinitionsPageProps) {
  const { language, definitionsLayout } = useAppSettings();
  const isRTL = language === "ar";
  const { token } = antTheme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "");

  const activeTabDef = tabs.find(t => t.key === activeTab) ?? tabs[0];

  const fadeStyle = {
    animation: "def-tab-fadein 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  } as const;

  // ── Vertical layout (left-nav card + right content card) ────────────────────
  if (definitionsLayout === "vertical") {
    return (
      <div style={{ direction: isRTL ? "rtl" : "ltr" }}>
        <style>{`@keyframes def-tab-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: token.colorText,
              display: "block",
            }}
          >
            {isRTL ? moduleNameAr : moduleName}
            <span
              style={{
                color: token.colorTextSecondary,
                fontSize: 13,
                fontWeight: 400,
                marginInlineStart: 10,
              }}
            >
              {isRTL ? moduleName : moduleNameAr}
            </span>
          </Text>
          <Text style={{ color: token.colorTextSecondary, fontSize: 13 }}>
            {isRTL
              ? "إدارة التعريفات والبيانات الأساسية للوحدة"
              : "Manage definitions and master data for this module"}
          </Text>
        </div>

        {/* Two-card layout */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          {/* Left nav card (top on mobile) */}
          <Card
            style={{ width: isMobile ? "100%" : 220, flexShrink: 0 }}
            styles={{ body: { padding: isMobile ? "4px 8px" : "8px 0" } }}
          >
            <div
              style={
                isMobile
                  ? {
                      display: "flex",
                      gap: 4,
                      flexWrap: "wrap",
                      padding: "4px 0",
                    }
                  : {}
              }
            >
              {tabs.map(tab => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={
                      isMobile
                        ? {
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 14px",
                            border: "none",
                            borderRadius: token.borderRadius,
                            background: isActive
                              ? token.colorPrimaryBg
                              : "transparent",
                            color: isActive
                              ? token.colorPrimary
                              : token.colorText,
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: isActive ? 600 : 400,
                            borderBottom: isActive
                              ? `2px solid ${token.colorPrimary}`
                              : "2px solid transparent",
                            transition: "all 0.15s",
                            whiteSpace: "nowrap",
                          }
                        : {
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            width: "100%",
                            padding: "10px 16px",
                            border: "none",
                            borderRadius: 0,
                            background: isActive
                              ? token.colorPrimaryBg
                              : "transparent",
                            color: isActive
                              ? token.colorPrimary
                              : token.colorText,
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: isActive ? 600 : 400,
                            borderInlineStart: isActive
                              ? `3px solid ${token.colorPrimary}`
                              : "3px solid transparent",
                            textAlign: "start",
                            transition: "all 0.15s",
                          }
                    }
                  >
                    <UnorderedListOutlined
                      style={{ fontSize: 14, flexShrink: 0 }}
                    />
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isRTL ? tab.labelAr : tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Right content card */}
          <Card
            style={{ flex: 1, minWidth: 0 }}
            styles={{ body: { padding: 24 } }}
          >
            {activeTabDef && (
              <div key={activeTabDef.key} style={fadeStyle}>
                <div
                  style={{
                    marginBottom: 20,
                    paddingBottom: 14,
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: token.colorText,
                      display: "block",
                    }}
                  >
                    {isRTL ? activeTabDef.labelAr : activeTabDef.label}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: token.colorTextSecondary }}
                  >
                    {isRTL
                      ? `إدارة ${activeTabDef.labelAr}`
                      : `Manage ${activeTabDef.label}`}
                  </Text>
                </div>
                {activeTabDef.customContent ?? (
                  <DefinitionsTab
                    key={activeTabDef.key}
                    tab={activeTabDef}
                    isRTL={isRTL}
                    formDesign={formDesign}
                    isMobile={isMobile}
                  />
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // ── Horizontal layout (top nav card + content card below) ───────────────────
  return (
    <div style={{ direction: isRTL ? "rtl" : "ltr" }}>
      <style>{`@keyframes def-tab-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: token.colorText,
            display: "block",
          }}
        >
          {isRTL ? moduleNameAr : moduleName}
          <span
            style={{
              color: token.colorTextSecondary,
              fontSize: 13,
              fontWeight: 400,
              marginInlineStart: 10,
            }}
          >
            {isRTL ? moduleName : moduleNameAr}
          </span>
        </Text>
        <Text style={{ color: token.colorTextSecondary, fontSize: 13 }}>
          {isRTL
            ? "إدارة التعريفات والبيانات الأساسية للوحدة"
            : "Manage definitions and master data for this module"}
        </Text>
      </div>

      {/* Top nav card */}
      <Card
        style={{ marginBottom: 16 }}
        styles={{ body: { padding: "4px 8px" } }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: token.borderRadius,
                  background: isActive ? token.colorPrimaryBg : "transparent",
                  color: isActive ? token.colorPrimary : token.colorText,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  borderBottom: isActive
                    ? `2px solid ${token.colorPrimary}`
                    : "2px solid transparent",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                <UnorderedListOutlined style={{ fontSize: 13 }} />
                {isRTL ? tab.labelAr : tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Content card */}
      <Card styles={{ body: { padding: 24 } }}>
        {activeTabDef && (
          <div key={activeTabDef.key} style={fadeStyle}>
            <div
              style={{
                marginBottom: 20,
                paddingBottom: 14,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: token.colorText,
                  display: "block",
                }}
              >
                {isRTL ? activeTabDef.labelAr : activeTabDef.label}
              </Text>
              <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                {isRTL
                  ? `إدارة ${activeTabDef.labelAr}`
                  : `Manage ${activeTabDef.label}`}
              </Text>
            </div>
            {activeTabDef.customContent ?? (
              <DefinitionsTab
                key={activeTabDef.key}
                tab={activeTabDef}
                isRTL={isRTL}
                formDesign={formDesign}
                isMobile={isMobile}
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
