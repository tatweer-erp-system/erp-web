import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedModal } from "@/components/AnimatedModal";
import { BulkActions } from "@/components/BulkActions";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/contexts/SettingsContext";
import { usersService } from "@/services/users.service";
import { rolesService } from "@/services/roles.service";
import { t } from "@/i18n";
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Printer,
  RotateCcw,
  Grid3x3,
  List,
  MoreVertical,
  Shield,
  X,
} from "lucide-react";
import type { User, UserRole } from "@/types/auth";

export default function Users() {
  const { language } = useSettings();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    selectedRoleIds: [] as string[],
  });

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.USERS, currentPage, pageSize, searchQuery],
    queryFn: () =>
      usersService.list({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
      }),
  });

  // Fetch available roles
  const { data: rolesData } = useQuery({
    queryKey: [QUERY_KEYS.ROLES],
    queryFn: () => rolesService.list(),
    staleTime: 10 * 60 * 1000,
  });

  const users = usersData?.data ?? [];
  const totalUsers = usersData?.total ?? 0;
  const totalPages = usersData?.totalPages ?? 1;
  const availableRoles = rolesData?.data ?? [];

  const handlePrint = () => window.print();

  const handleExport = () => {
    const csv = [
      ["Name", "Email", "Roles"],
      ...users.map(u => [
        `${u.firstName} ${u.lastName}`,
        u.email,
        (u.roles ?? []).map(r => r.name).join("; "),
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-export.csv";
    a.click();
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      selectedRoleIds: (user.roles ?? []).map(r => r.id),
    });
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      selectedRoleIds: [],
    });
    setIsCreateModalOpen(true);
  };

  const toggleRole = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRoleIds: prev.selectedRoleIds.includes(roleId)
        ? prev.selectedRoleIds.filter(id => id !== roleId)
        : [...prev.selectedRoleIds, roleId],
    }));
  };

  const breadcrumbs = [
    { label: t("Dashboard", language), href: "/" },
    { label: t("Settings", language), href: "#" },
    { label: t("Users", language) },
  ];

  return (
    <DashboardLayout currentPage="Users" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header Section */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isRTL ? "text-right" : ""}`}
        >
          <Button
            className="bg-primary hover:bg-blue-700 text-white flex items-center gap-2 w-full sm:w-auto"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            {t("Users", language)}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              {t("Users", language)}
            </p>
            <h3 className="text-2xl font-bold text-foreground mt-2">
              {totalUsers}
            </h3>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              {t("roles", language)}
            </p>
            <h3 className="text-2xl font-bold text-primary mt-2">
              {availableRoles.length}
            </h3>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              {t("Roles & Permissions", language)}
            </p>
            <h3 className="text-2xl font-bold text-green-600 mt-2">
              <Shield size={24} />
            </h3>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <BulkActions
            selectedCount={selectedItems.length}
            isAllSelected={selectedItems.length === users.length}
            onSelectAll={checked => {
              setSelectedItems(checked ? users.map(u => u.id) : []);
            }}
            onDelete={() => setSelectedItems([])}
            onExport={() => {
              handleExport();
              setSelectedItems([]);
            }}
            onStatusUpdate={() => setSelectedItems([])}
          />
        )}

        {/* Search and Controls */}
        <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex-1 min-w-xs">
              <Input
                type="text"
                placeholder={`${t("Search", language)}...`}
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`${isRTL ? "pr-12 text-right" : "pl-12"} bg-secondary border-0`}
              />
            </div>

            <Button
              variant="outline"
              className="border-border"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] })
              }
            >
              <RotateCcw size={16} />
            </Button>
            <Button
              variant="outline"
              className="border-border"
              onClick={handlePrint}
            >
              <Printer size={16} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-border flex items-center gap-2"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isRTL ? "start" : "end"}
                className="w-48"
              >
                <DropdownMenuItem onClick={handleExport}>
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex gap-1 border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded transition-colors ${viewMode === "table" ? "bg-primary text-white" : "text-foreground hover:bg-secondary"}`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-primary text-white" : "text-foreground hover:bg-secondary"}`}
              >
                <Grid3x3 size={16} />
              </button>
            </div>
          </div>
        </Card>

        {/* Table View */}
        {viewMode === "table" && (
          <Card className="dark:bg-card bg-card shadow-sm border-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedItems.length === users.length &&
                          users.length > 0
                        }
                        onChange={e =>
                          setSelectedItems(
                            e.target.checked ? users.map(u => u.id) : []
                          )
                        }
                        className="w-4 h-4 rounded border-border"
                      />
                    </th>
                    <th
                      className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {t("name", language)}
                    </th>
                    <th
                      className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {t("email", language)}
                    </th>
                    <th
                      className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {t("roles", language)}
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-center">
                      {t("actions", language)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr
                      key={user.id}
                      className="border-b border-border hover:bg-secondary/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(user.id)}
                          onChange={e => {
                            setSelectedItems(
                              e.target.checked
                                ? [...selectedItems, user.id]
                                : selectedItems.filter(id => id !== user.id)
                            );
                          }}
                          className="w-4 h-4 rounded border-border"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {(user.roles ?? []).map(role => (
                            <span
                              key={role.id}
                              className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                              {role.name}
                            </span>
                          ))}
                          {(!user.roles || user.roles.length === 0) && (
                            <span className="text-xs text-muted-foreground">
                              --
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? "start" : "end"}>
                            <DropdownMenuItem
                              onClick={() => openEditModal(user)}
                            >
                              <Edit size={14} className="mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 size={14} className="mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && !isLoading && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-muted-foreground"
                      >
                        {t("noData", language)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                {t("Users", language)}: {totalUsers}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(totalPages, 5) },
                    (_, i) => i + 1
                  ).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-border rounded-lg text-sm dark:bg-card bg-card text-foreground"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </Card>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => (
              <Card
                key={user.id}
                className="p-4 dark:bg-card bg-card shadow-sm border-0"
              >
                <div className="flex items-start justify-between">
                  <div className={isRTL ? "text-right" : ""}>
                    <h3 className="font-semibold text-foreground">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.email}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(user.roles ?? []).map(role => (
                        <span
                          key={role.id}
                          className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(user)}
                  >
                    <Edit size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Modal with Roles Multi-select */}
        <AnimatedModal
          isOpen={isCreateModalOpen || isEditModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setEditingUser(null);
          }}
          title={isEditModalOpen ? "Edit User" : "Create User"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("name", language)} (First)
              </label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={e =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("name", language)} (Last)
              </label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={e =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Last name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("email", language)}
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="user@company.com"
              />
            </div>

            {/* Roles multi-select */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("assignRoles", language)}
              </label>
              {/* Selected roles as tags */}
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.selectedRoleIds.map(roleId => {
                  const role = availableRoles.find(r => r.id === roleId);
                  if (!role) return null;
                  return (
                    <span
                      key={roleId}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      <Shield size={12} />
                      {role.name}
                      <button
                        type="button"
                        onClick={() => toggleRole(roleId)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  );
                })}
              </div>
              {/* Available roles to pick */}
              <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-secondary/30">
                {availableRoles.map(role => {
                  const isSelected = formData.selectedRoleIds.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-card text-foreground border border-border hover:bg-secondary"
                      }`}
                    >
                      {role.name}
                    </button>
                  );
                })}
                {availableRoles.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t("noData", language)}
                  </p>
                )}
              </div>
            </div>

            <Button className="w-full bg-primary hover:bg-blue-700 text-white">
              {t("save", language)}
            </Button>
          </div>
        </AnimatedModal>
      </div>
    </DashboardLayout>
  );
}
