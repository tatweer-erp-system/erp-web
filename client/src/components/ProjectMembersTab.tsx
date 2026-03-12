import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import AnimatedModal from "@/components/AnimatedModal";
import { projectsService } from "@/services/projects.service";
import { usersService } from "@/services/users.service";
import { useSettings } from "@/contexts/SettingsContext";
import { t } from "@/i18n";
import { Plus, Trash2, UserPlus, Shield, Eye, User } from "lucide-react";
import type { ProjectMember } from "@/types/modules/sales";

interface ProjectMembersTabProps {
  projectId: string;
}

const MEMBER_ROLES = ["owner", "member", "viewer"] as const;

function getRoleBadgeStyle(role: string) {
  switch (role) {
    case "owner":
      return "bg-purple-100 text-purple-700";
    case "member":
      return "bg-blue-100 text-blue-700";
    case "viewer":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-secondary text-muted-foreground";
  }
}

function getRoleIcon(role: string) {
  switch (role) {
    case "owner":
      return <Shield size={14} />;
    case "member":
      return <User size={14} />;
    case "viewer":
      return <Eye size={14} />;
    default:
      return <User size={14} />;
  }
}

export default function ProjectMembersTab({ projectId }: ProjectMembersTabProps) {
  const { language } = useSettings();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);
  const [newMemberUserId, setNewMemberUserId] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<string>("member");
  const [userSearch, setUserSearch] = useState("");

  // Fetch project members
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: () => projectsService.getMembers(projectId),
    enabled: !!projectId,
  });

  // Fetch available users for the add modal
  const { data: usersData } = useQuery({
    queryKey: ["users-list", userSearch],
    queryFn: () => usersService.list({ page: 1, limit: 20, search: userSearch }),
    enabled: isAddModalOpen,
  });

  const members = membersData?.data ?? [];
  const availableUsers = usersData?.data ?? [];

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (data: { userId: string; role: string }) =>
      projectsService.addMember(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
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
      queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) =>
      projectsService.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-members", projectId] });
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
      <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
        <h3 className="text-sm font-semibold text-foreground">
          {t("projectMembers", language)}
        </h3>
        <Button
          className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <UserPlus size={16} />
          {t("addMember", language)}
        </Button>
      </div>

      {/* Members List */}
      {membersLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : members.length === 0 ? (
        <Card className="p-8 text-center border border-border bg-secondary/20 shadow-none">
          <p className="text-muted-foreground">{t("noData", language)}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((memberItem) => (
            <div
              key={memberItem.id}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {memberItem.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{memberItem.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Inline role change */}
                <select
                  value={memberItem.role}
                  onChange={(e) =>
                    updateRoleMutation.mutate({
                      userId: memberItem.userId,
                      role: e.target.value,
                    })
                  }
                  className="px-2 py-1 text-xs border border-border rounded-lg bg-card text-foreground"
                >
                  {MEMBER_ROLES.map((r) => (
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
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setMemberToRemove(memberItem);
                    setIsRemoveConfirmOpen(true);
                  }}
                >
                  <Trash2 size={16} />
                </Button>
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
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("selectUser", language)}
            </label>
            <Input
              type="text"
              placeholder={t("Search", language)}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="mb-2 bg-secondary border-0"
            />
            <select
              value={newMemberUserId}
              onChange={(e) => setNewMemberUserId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm dark:bg-card bg-card text-foreground"
            >
              <option value="">{t("selectUser", language)}</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t("memberRole", language)}
            </label>
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm dark:bg-card bg-card text-foreground"
            >
              {MEMBER_ROLES.map((r) => (
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
        <p className="text-sm text-muted-foreground">
          {t("removeMemberConfirm", language)}
        </p>
        {memberToRemove && (
          <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-sm font-medium text-foreground">{memberToRemove.user.name}</p>
            <p className="text-xs text-muted-foreground">{memberToRemove.user.email}</p>
          </div>
        )}
      </AnimatedModal>
    </div>
  );
}
