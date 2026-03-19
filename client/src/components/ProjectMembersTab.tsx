import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { Button, Input, Card } from "antd";
import { AnimatedModal } from "@/components/AnimatedModal";
import { projectsService } from "@/services/projects.service";
import { usersService } from "@/services/users.service";
import { useSettings } from "@/contexts/SettingsContext";
import { t } from "@/i18n";
import { Plus, Trash2, UserPlus, Shield, Eye, User } from "lucide-react";
import type { ProjectMember } from "@/types/modules/projects";
import { MemberRole } from "@/constants/enums";

type ProjectMembersTabProps = {
  projectId: string;
};

const MEMBER_ROLES = ["owner", "member", "viewer"] as const;

function getRoleBadgeStyle(role: string) {
  switch (role) {
    case MemberRole.OWNER:
      return "bg-purple-100 text-purple-700";
    case MemberRole.MEMBER:
      return "bg-blue-100 text-blue-700";
    case MemberRole.VIEWER:
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-50 text-gray-400";
  }
}

function getRoleIcon(role: string) {
  switch (role) {
    case MemberRole.OWNER:
      return <Shield size={14} />;
    case MemberRole.MEMBER:
      return <User size={14} />;
    case MemberRole.VIEWER:
      return <Eye size={14} />;
    default:
      return <User size={14} />;
  }
}

export function ProjectMembersTab({ projectId }: ProjectMembersTabProps) {
  const { language } = useSettings();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(
    null
  );
  const [newMemberUserId, setNewMemberUserId] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<string>("member");
  const [userSearch, setUserSearch] = useState("");

  // Fetch project members
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: [QUERY_KEYS.PROJECT_MEMBERS, projectId],
    queryFn: () => projectsService.getMembers(projectId),
    enabled: !!projectId,
  });

  // Fetch available users for the add modal
  const { data: usersData } = useQuery({
    queryKey: [QUERY_KEYS.USERS_LIST, userSearch],
    queryFn: () =>
      usersService.list({ page: 1, limit: 20, search: userSearch }),
    enabled: isAddModalOpen,
  });

  const members = membersData?.data ?? [];
  const availableUsers = usersData?.data ?? [];

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (data: { userId: string; role: string }) =>
      projectsService.addMember(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROJECT_MEMBERS, projectId],
      });
      setIsAddModalOpen(false);
      setNewMemberUserId("");
      setNewMemberRole("member");
    },
  });

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      projectsService.updateMemberRole(projectId, userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROJECT_MEMBERS, projectId],
      });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) =>
      projectsService.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROJECT_MEMBERS, projectId],
      });
      setIsRemoveConfirmOpen(false);
      setMemberToRemove(null);
    },
  });

  const handleAddMember = () => {
    if (!newMemberUserId || !newMemberRole) return;
    addMemberMutation.mutate({ userId: newMemberUserId, role: newMemberRole });
  };

  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    removeMemberMutation.mutate(memberToRemove.userId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <h3 className="text-sm font-semibold">
          {t("projectMembers", language)}
        </h3>
        <Button
          type="primary"
          icon={<UserPlus size={16} />}
          onClick={() => setIsAddModalOpen(true)}
        >
          {t("addMember", language)}
        </Button>
      </div>

      {/* Members List */}
      {membersLoading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : members.length === 0 ? (
        <Card className="text-center border shadow-none">
          <p className="text-gray-400 py-4">{t("noData", language)}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map(memberItem => (
            <div
              key={memberItem.id}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <User size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {memberItem.user?.name ?? "—"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {memberItem.user?.email ?? "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Inline role change */}
                <select
                  value={memberItem.role}
                  onChange={e =>
                    updateRoleMutation.mutate({
                      userId: memberItem.userId,
                      role: e.target.value,
                    })
                  }
                  className="px-2 py-1 text-xs border rounded-lg bg-white dark:bg-gray-800"
                >
                  {MEMBER_ROLES.map(r => (
                    <option key={r} value={r}>
                      {t(r, language)}
                    </option>
                  ))}
                </select>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeStyle(memberItem.role)}`}
                >
                  {getRoleIcon(memberItem.role)}
                  {t(memberItem.role, language)}
                </span>

                <Button
                  type="text"
                  size="small"
                  danger
                  onClick={() => {
                    setMemberToRemove(memberItem);
                    setIsRemoveConfirmOpen(true);
                  }}
                  icon={<Trash2 size={16} />}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      <AnimatedModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewMemberUserId("");
          setNewMemberRole("member");
          setUserSearch("");
        }}
        title={t("addMember", language)}
        onSubmit={handleAddMember}
        submitLabel={t("addMember", language)}
      >
        <div className="space-y-4">
          {/* User search/select */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("selectUser", language)}
            </label>
            <Input
              placeholder={t("Search", language)}
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="mb-2"
            />
            <select
              value={newMemberUserId}
              onChange={e => setNewMemberUserId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
            >
              <option value="">{t("selectUser", language)}</option>
              {availableUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("memberRole", language)}
            </label>
            <select
              value={newMemberRole}
              onChange={e => setNewMemberRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
            >
              {MEMBER_ROLES.map(r => (
                <option key={r} value={r}>
                  {t(r, language)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </AnimatedModal>

      {/* Remove Confirmation Modal */}
      <AnimatedModal
        isOpen={isRemoveConfirmOpen}
        onClose={() => {
          setIsRemoveConfirmOpen(false);
          setMemberToRemove(null);
        }}
        title={t("removeMember", language)}
        onSubmit={handleRemoveMember}
        submitLabel={t("confirm", language)}
        size="sm"
      >
        <p className="text-sm text-gray-400">
          {t("removeMemberConfirm", language)}
        </p>
        {memberToRemove && (
          <div className="mt-3 p-3 rounded-lg bg-gray-50 border">
            <p className="text-sm font-medium">{memberToRemove.user?.name}</p>
            <p className="text-xs text-gray-400">{memberToRemove.user?.email}</p>
          </div>
        )}
      </AnimatedModal>
    </div>
  );
}
