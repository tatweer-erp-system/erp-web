import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { accountsService } from "@/services/accounting.service";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AccountType, NormalBalance } from "@/constants/enums";
import {
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Button,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Table,
  Space,
  Statistic,
  Alert,
  message,
  theme as antTheme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SearchOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";

const { Text, Title } = Typography;

// ─── Types ──────────────────────────────────────────────────────────────────

interface Account {
  id?: string;
  code: string;
  nameEn: string;
  nameAr: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  normalBalance: "debit" | "credit";
  balance?: number;
  isActive: boolean;
  allowDirectPosting?: boolean;
  openingBalance?: number;
  children?: Account[];
  version?: number;
}

interface BalanceEntry {
  accountId: string;
  amount: number;
  originalAmount: number;
  version: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { color: string }> = {
  [AccountType.ASSET]: { color: "#3B82F6" },
  [AccountType.LIABILITY]: { color: "#F59E0B" },
  [AccountType.EQUITY]: { color: "#10B981" },
  [AccountType.REVENUE]: { color: "#8B5CF6" },
  [AccountType.EXPENSE]: { color: "#EF4444" },
};

const TYPE_LABEL_KEYS: Record<string, string> = {
  [AccountType.ASSET]: "Asset",
  [AccountType.LIABILITY]: "Liability",
  [AccountType.EQUITY]: "Equity",
  [AccountType.REVENUE]: "Revenue",
  [AccountType.EXPENSE]: "Expense",
};

/** Flatten a COA tree, keeping only leaf accounts that allow direct posting */
function flattenPostable(nodes: Account[]): Account[] {
  const result: Account[] = [];
  function walk(list: Account[]) {
    for (const node of list) {
      if (node.allowDirectPosting && node.id) {
        result.push(node);
      }
      if (node.children?.length) {
        walk(node.children);
      }
    }
  }
  walk(nodes);
  return result;
}

// ─── Page content ───────────────────────────────────────────────────────────

function OpeningBalancesContent() {
  const { lang } = useLangStore();
  const { token } = antTheme.useToken();
  const queryClient = useQueryClient();
  const isRtl = lang === "ar";

  // State
  const [balanceDate, setBalanceDate] = useState<Dayjs | null>(null);
  const [balances, setBalances] = useState<Record<string, BalanceEntry>>({});
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Fetch tree
  const { data: treeData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS_TREE],
    queryFn: () => accountsService.tree(),
  });

  // Flatten to postable accounts
  const accounts = useMemo(() => {
    if (!treeData) return [];
    return flattenPostable(treeData as Account[]);
  }, [treeData]);

  // Initialize balances from fetched data (only once per fetch)
  useMemo(() => {
    if (!accounts.length) return;
    const initial: Record<string, BalanceEntry> = {};
    for (const acc of accounts) {
      if (acc.id) {
        initial[acc.id] = {
          accountId: acc.id,
          amount: Number(acc.openingBalance ?? 0),
          originalAmount: Number(acc.openingBalance ?? 0),
          version: acc.version ?? 0,
        };
      }
    }
    setBalances(initial);
  }, [accounts]);

  // Filter accounts
  const filtered = useMemo(() => {
    let list = accounts;
    if (typeFilter !== "all") {
      list = list.filter(a => a.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        a =>
          a.code.toLowerCase().includes(q) ||
          a.nameEn.toLowerCase().includes(q) ||
          a.nameAr.toLowerCase().includes(q)
      );
    }
    return list;
  }, [accounts, typeFilter, search]);

  // Track modified entries
  const modifiedEntries = useMemo(() => {
    return Object.values(balances).filter(b => b.amount !== b.originalAmount);
  }, [balances]);

  // Compute totals (debit accounts with positive balance = debit, credit accounts with positive balance = credit)
  const { totalDebit, totalCredit } = useMemo(() => {
    let debit = 0;
    let credit = 0;
    for (const acc of accounts) {
      if (!acc.id) continue;
      const entry = balances[acc.id];
      const amount = entry?.amount ?? 0;
      if (amount === 0) continue;
      if (acc.normalBalance === NormalBalance.DEBIT) {
        debit += amount;
      } else {
        credit += amount;
      }
    }
    return { totalDebit: debit, totalCredit: credit };
  }, [accounts, balances]);

  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  // Handle balance change
  const handleBalanceChange = useCallback(
    (accountId: string, value: number | null) => {
      setBalances(prev => ({
        ...prev,
        [accountId]: {
          ...prev[accountId],
          amount: value ?? 0,
        },
      }));
    },
    []
  );

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!balanceDate) {
        throw new Error("Date required");
      }
      const dateStr = balanceDate.format("YYYY-MM-DD");
      const promises = modifiedEntries.map(entry =>
        accountsService.update(entry.accountId, {
          openingBalance: entry.amount,
          openingBalanceDate: dateStr,
          version: entry.version,
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      message.success(t("accounting.ob.saved", lang));
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ACCOUNTS_TREE],
      });
    },
    onError: () => {
      message.error("Failed to save opening balances");
    },
  });

  // ─── Table columns ──────────────────────────────────────────────────────

  const columns: ColumnsType<Account> = [
    {
      title: t("accounting.ob.code", lang),
      dataIndex: "code",
      key: "code",
      width: 120,
      sorter: (a, b) => a.code.localeCompare(b.code),
      render: (code: string) => (
        <Text code style={{ fontFamily: "monospace", fontSize: 13 }}>
          {code}
        </Text>
      ),
    },
    {
      title: t("accounting.ob.accountName", lang),
      key: "name",
      ellipsis: true,
      sorter: (a, b) => getName(a).localeCompare(getName(b)),
      render: (_: unknown, record: Account) => {
        const modified =
          record.id && balances[record.id]
            ? balances[record.id].amount !== balances[record.id].originalAmount
            : false;
        return (
          <Space>
            <Text strong>{getName(record)}</Text>
            {modified && (
              <Tag color="blue" style={{ fontSize: 11 }}>
                {t("accounting.ob.modified", lang)}
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: t("accounting.ob.accountType", lang),
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => {
        const meta = TYPE_META[type];
        return (
          <Tag color={meta?.color} style={{ borderRadius: 4, fontWeight: 500 }}>
            {t(TYPE_LABEL_KEYS[type] ?? type, lang)}
          </Tag>
        );
      },
    },
    {
      title: t("accounting.ob.normalBalance", lang),
      dataIndex: "normalBalance",
      key: "normalBalance",
      width: 130,
      render: (nb: string) => (
        <Tag color={nb === NormalBalance.DEBIT ? "blue" : "orange"}>
          {nb === NormalBalance.DEBIT
            ? t("accounting.ob.debit", lang)
            : t("accounting.ob.credit", lang)}
        </Tag>
      ),
    },
    {
      title: t("accounting.ob.balance", lang),
      key: "openingBalance",
      width: 200,
      render: (_: unknown, record: Account) => {
        const entry = record.id ? balances[record.id] : undefined;
        return (
          <InputNumber
            value={entry?.amount ?? 0}
            onChange={val => record.id && handleBalanceChange(record.id, val)}
            min={0}
            precision={2}
            style={{ width: "100%" }}
            formatter={value =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={value => Number(value?.replace(/\$\s?|(,*)/g, "") ?? 0)}
          />
        );
      },
    },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div style={{ direction: isRtl ? "rtl" : "ltr" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          {t("accounting.ob.title", lang)}
        </Title>
        <Text type="secondary">{t("accounting.ob.subtitle", lang)}</Text>
      </div>

      {/* Info alert */}
      <Alert
        title={t("accounting.ob.info", lang)}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Summary KPI cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title={t("accounting.ob.totalDebit", lang)}
              value={totalDebit}
              precision={2}
              prefix={
                <span style={{ color: token.colorPrimary, fontSize: 16 }}>
                  DR
                </span>
              }
              styles={{ content: { color: token.colorPrimary } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title={t("accounting.ob.totalCredit", lang)}
              value={totalCredit}
              precision={2}
              prefix={
                <span style={{ color: "#F59E0B", fontSize: 16 }}>CR</span>
              }
              styles={{ content: { color: "#F59E0B" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <Statistic
              title={
                isBalanced
                  ? t("accounting.ob.balanced", lang)
                  : t("accounting.ob.unbalanced", lang)
              }
              value={Math.abs(totalDebit - totalCredit)}
              precision={2}
              prefix={
                isBalanced ? (
                  <CheckCircleOutlined
                    style={{ color: token.colorSuccess, fontSize: 18 }}
                  />
                ) : (
                  <WarningOutlined
                    style={{ color: token.colorError, fontSize: 18 }}
                  />
                )
              }
              styles={{ content: {
                color: isBalanced ? token.colorSuccess : token.colorError,
              } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Toolbar */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Space orientation="vertical" size={2} style={{ width: "100%" }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <CalendarOutlined /> {t("accounting.ob.date", lang)}
              </Text>
              <DatePicker
                value={balanceDate}
                onChange={setBalanceDate}
                placeholder={t("accounting.ob.selectDate", lang)}
                style={{ width: "100%" }}
              />
            </Space>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Space orientation="vertical" size={2} style={{ width: "100%" }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t("accounting.ob.search", lang)}
              </Text>
              <Input
                placeholder={t("accounting.ob.search", lang)}
                prefix={<SearchOutlined />}
                value={search}
                onChange={e => setSearch(e.target.value)}
                allowClear
              />
            </Space>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Space orientation="vertical" size={2} style={{ width: "100%" }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t("accounting.ob.accountType", lang)}
              </Text>
              <Select
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ width: "100%" }}
                options={[
                  {
                    value: "all",
                    label: t("accounting.ob.allTypes", lang),
                  },
                  {
                    value: AccountType.ASSET,
                    label: t("Asset", lang),
                  },
                  {
                    value: AccountType.LIABILITY,
                    label: t("Liability", lang),
                  },
                  {
                    value: AccountType.EQUITY,
                    label: t("Equity", lang),
                  },
                  {
                    value: AccountType.REVENUE,
                    label: t("Revenue", lang),
                  },
                  {
                    value: AccountType.EXPENSE,
                    label: t("Expense", lang),
                  },
                ]}
              />
            </Space>
          </Col>
          <Col flex="auto" />
          <Col>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saveMutation.isPending}
              disabled={
                modifiedEntries.length === 0 || !balanceDate || !isBalanced
              }
              onClick={() => saveMutation.mutate()}
              style={{ marginTop: 18 }}
            >
              {saveMutation.isPending
                ? t("accounting.ob.saving", lang)
                : `${t("accounting.ob.save", lang)}${modifiedEntries.length > 0 ? ` (${modifiedEntries.length})` : ""}`}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Must-balance warning */}
      {!isBalanced && modifiedEntries.length > 0 && (
        <Alert
          title={t("accounting.ob.mustBalance", lang)}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Accounts table */}
      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Table<Account>
          columns={columns}
          dataSource={filtered}
          rowKey={record => record.id ?? record.code}
          loading={isLoading}
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            pageSizeOptions: ["25", "50", "100"],
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
          }}
          size="middle"
          scroll={{ x: 700 }}
          locale={{
            emptyText: t("No data", lang),
          }}
        />
      </Card>
    </div>
  );
}

// ─── Default export with layout ─────────────────────────────────────────────

export default function OpeningBalances() {
  const { lang } = useLangStore();
  return (
    <DashboardLayout
      currentPage={t("accounting.ob.title", lang)}
      breadcrumbs={[
        { label: t("ACCOUNTING", lang), href: "/accounting" },
        { label: t("accounting.ob.title", lang) },
      ]}
    >
      <OpeningBalancesContent />
    </DashboardLayout>
  );
}
