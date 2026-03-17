import { useState, useMemo, useCallback, memo, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import {
  Table,
  Button,
  Card,
  Space,
  DatePicker,
  Input,
  InputNumber,
  Alert,
  Typography,
  Tag,
  message,
  Spin,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  SaveOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  accountsService,
  journalEntriesService,
} from "@/services/accounting.service";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type {
  Account,
  CreateJournalEntryDto,
} from "@/types/modules/accounting";
import { JournalEntryType } from "@/constants/enums";
import { t } from "@/i18n";
import dayjs from "dayjs";

const { Text, Title } = Typography;

// ─── Helpers ────────────────────────────────────────────────────────────────────

interface BalanceEntry {
  debit: number;
  credit: number;
}

function flattenAccounts(accounts: Account[]): Account[] {
  const result: Account[] = [];
  function walk(list: Account[]) {
    for (const acc of list) {
      if (acc.allowDirectPosting) {
        result.push(acc);
      }
      if (acc.children?.length) {
        walk(acc.children);
      }
    }
  }
  walk(accounts);
  return result;
}

// ─── Input cell (manages own state, never causes parent re-render) ──────────

const BalanceInputCell = memo(function BalanceInputCell({
  accountId,
  field,
  initial,
  disabled,
  onUpdate,
}: {
  accountId: string;
  field: "debit" | "credit";
  initial: number;
  disabled: boolean;
  onUpdate: (
    accountId: string,
    field: "debit" | "credit",
    value: number
  ) => void;
}) {
  const [value, setValue] = useState(initial);

  const handleChange = useCallback(
    (v: number | null) => {
      const val = v ?? 0;
      setValue(val);
      onUpdate(accountId, field, val);
    },
    [accountId, field, onUpdate]
  );

  return (
    <InputNumber
      min={0}
      precision={2}
      value={value || undefined}
      placeholder="0.00"
      style={{ width: "100%" }}
      onChange={handleChange}
      disabled={disabled}
    />
  );
});

// ─── Memoized table (isolated from parent totals state) ─────────────────────

const BalancesTable = memo(function BalancesTable({
  accounts,
  isLoading,
  lang,
  primary,
  disabled,
  balancesRef,
  onUpdate,
  search,
  onSearchChange,
}: {
  accounts: Account[];
  isLoading: boolean;
  lang: string;
  primary: string;
  disabled: boolean;
  balancesRef: React.RefObject<Record<string, BalanceEntry>>;
  onUpdate: (
    accountId: string,
    field: "debit" | "credit",
    value: number
  ) => void;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const columns: TableColumnsType<Account> = useMemo(
    () => [
      {
        title: t("accounting.ob.code", lang),
        dataIndex: "code",
        width: 120,
        fixed: "left",
        sorter: (a, b) => a.code.localeCompare(b.code),
        render: (v: string) => (
          <Text strong style={{ fontFamily: "monospace", color: primary }}>
            {v}
          </Text>
        ),
      },
      {
        title: t("accounting.ob.accountName", lang),
        key: "name",
        ellipsis: true,
        sorter: (a, b) => getName(a).localeCompare(getName(b)),
        render: (_: unknown, rec: Account) => <Text>{getName(rec)}</Text>,
      },
      {
        title: t("accounting.ob.accountType", lang),
        dataIndex: "type",
        width: 120,
        render: (v: string) => (
          <Tag style={{ borderRadius: 20, textTransform: "capitalize" }}>
            {v}
          </Tag>
        ),
      },
      {
        title: t("accounting.ob.totalDebit", lang),
        key: "debit",
        width: 180,
        render: (_: unknown, rec: Account) => (
          <BalanceInputCell
            accountId={rec.id}
            field="debit"
            initial={balancesRef.current?.[rec.id]?.debit ?? 0}
            disabled={disabled}
            onUpdate={onUpdate}
          />
        ),
      },
      {
        title: t("accounting.ob.totalCredit", lang),
        key: "credit",
        width: 180,
        render: (_: unknown, rec: Account) => (
          <BalanceInputCell
            accountId={rec.id}
            field="credit"
            initial={balancesRef.current?.[rec.id]?.credit ?? 0}
            disabled={disabled}
            onUpdate={onUpdate}
          />
        ),
      },
    ],
    [lang, primary, disabled, onUpdate, balancesRef]
  );

  return (
    <Card styles={{ body: { padding: 0 } }}>
      <div style={{ padding: "12px 16px 0" }}>
        <Input
          prefix={<SearchOutlined style={{ color: "#aaa" }} />}
          placeholder={t("accounting.common.search", lang)}
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          allowClear
          style={{ maxWidth: 320 }}
        />
      </div>
      <Spin spinning={isLoading}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={accounts}
          size="middle"
          scroll={{ x: "max-content" }}
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}–${range[1]} / ${total}`,
            pageSizeOptions: ["25", "50", "100", "200"],
          }}
          locale={{ emptyText: isLoading ? " " : undefined }}
        />
      </Spin>
    </Card>
  );
});

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function OpeningBalances() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const primary = theme === "dark" ? "#37D399" : "#3B82F6";

  const [balanceDate, setBalanceDate] = useState<dayjs.Dayjs | null>(null);
  const balancesRef = useRef<Record<string, BalanceEntry>>({});
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });
  const [search, setSearch] = useState("");

  // ── Fetch accounts tree ───────────────────────────────────────────────────────
  const { data: accountsTree, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS_TREE],
    queryFn: () => accountsService.tree(),
  });

  const flatAccounts = useMemo(
    () => (accountsTree ? flattenAccounts(accountsTree) : []),
    [accountsTree]
  );

  const filteredAccounts = useMemo(() => {
    if (!search.trim()) return flatAccounts;
    const q = search.trim().toLowerCase();
    return flatAccounts.filter(
      a =>
        a.code.toLowerCase().includes(q) ||
        a.nameEn.toLowerCase().includes(q) ||
        a.nameAr.includes(q)
    );
  }, [flatAccounts, search]);

  const isBalanced =
    Math.abs(totals.debit - totals.credit) < 0.005 && totals.debit > 0;
  const hasEntries = totals.debit > 0 || totals.credit > 0;
  const canSave = isBalanced && balanceDate !== null;

  // ── Update handler (updates ref + recalculates totals) ──────────────────────
  const handleUpdate = useCallback(
    (accountId: string, field: "debit" | "credit", value: number) => {
      const existing = balancesRef.current[accountId] ?? {
        debit: 0,
        credit: 0,
      };
      const updated = { ...existing, [field]: value };
      if (updated.debit === 0 && updated.credit === 0) {
        delete balancesRef.current[accountId];
      } else {
        balancesRef.current[accountId] = updated;
      }
      let d = 0,
        c = 0;
      for (const b of Object.values(balancesRef.current)) {
        d += b.debit ?? 0;
        c += b.credit ?? 0;
      }
      setTotals({ debit: d, credit: c });
    },
    []
  );

  // ── Save mutation ─────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      const lines = Object.entries(balancesRef.current)
        .filter(([, b]) => b.debit > 0 || b.credit > 0)
        .map(([accountId, b]) => ({
          accountId,
          debit: b.debit ?? 0,
          credit: b.credit ?? 0,
        }));

      const dto: CreateJournalEntryDto = {
        entryType: JournalEntryType.OPENING,
        entryDate: balanceDate!.format("YYYY-MM-DD"),
        description: "Opening Balances",
        lines,
      };

      const created = await journalEntriesService.create(dto);
      await journalEntriesService.post(created.id);
      return created;
    },
    onSuccess: () => {
      message.success(t("accounting.ob.saved", lang));
      balancesRef.current = {};
      setTotals({ debit: 0, credit: 0 });
      setBalanceDate(null);
    },
    onError: () => {
      message.error(t("mySettings.error.save", lang));
    },
  });

  return (
    <DashboardLayout
      currentPage="OpeningBalances"
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        { label: t("Accounting", lang), href: "#" },
        { label: t("accounting.ob.title", lang) },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {t("accounting.ob.title", lang)}
          </Title>
          <Text type="secondary">{t("accounting.ob.subtitle", lang)}</Text>
        </div>

        {/* ── Info Alert ───────────────────────────────────────────────────── */}
        <Alert
          type="info"
          showIcon
          message={t("accounting.ob.info", lang)}
          style={{ borderRadius: 8 }}
        />

        {/* ── Date Picker ──────────────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <Space align="center">
            <Text strong>{t("accounting.ob.date", lang)}:</Text>
            <DatePicker
              value={balanceDate}
              onChange={setBalanceDate}
              placeholder={t("accounting.ob.selectDate", lang)}
              style={{ width: 220 }}
              disabled={saveMutation.isPending}
            />
          </Space>
        </Card>

        {/* ── Accounts Table (memoized — not affected by totals state) ───── */}
        <BalancesTable
          accounts={filteredAccounts}
          isLoading={isLoading}
          lang={lang}
          primary={primary}
          disabled={saveMutation.isPending}
          balancesRef={balancesRef}
          onUpdate={handleUpdate}
          search={search}
          onSearchChange={setSearch}
        />

        {/* ── Totals Footer ────────────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space size={32}>
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block" }}
                >
                  {t("accounting.ob.totalDebit", lang)}
                </Text>
                <Text strong style={{ fontSize: 20 }}>
                  {totals.debit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </div>
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block" }}
                >
                  {t("accounting.ob.totalCredit", lang)}
                </Text>
                <Text strong style={{ fontSize: 20 }}>
                  {totals.credit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </div>
              <div>
                {hasEntries && (
                  <Tag
                    icon={
                      isBalanced ? <CheckCircleOutlined /> : <WarningOutlined />
                    }
                    color={isBalanced ? "success" : "error"}
                    style={{
                      borderRadius: 20,
                      padding: "4px 12px",
                      fontSize: 13,
                    }}
                  >
                    {isBalanced
                      ? t("accounting.ob.balanced", lang)
                      : t("accounting.ob.mustBalance", lang)}
                  </Tag>
                )}
              </div>
            </Space>

            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              disabled={!canSave}
              loading={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {t("accounting.ob.save", lang)}
            </Button>
          </div>
        </Card>
      </Space>
    </DashboardLayout>
  );
}
