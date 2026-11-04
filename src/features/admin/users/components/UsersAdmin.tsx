"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Plus, Trash2, UserCheck, UserX, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePrincipal } from "@/features/admin/auth/hooks";
import { hasPermission, type AdminUser } from "@/features/admin/auth/types";
import {
  createUser,
  deleteUser,
  listRoles,
  listUsers,
  revokeUserSessions,
  setUserActive,
  updateUser,
} from "@/features/admin/shared/api";
import { DataTable, type Column } from "@/features/admin/shared/components/DataTable";
import { Badge, ConfirmDialog, IconButton, Modal } from "@/features/admin/shared/components/primitives";
import { Field, inputClass, Notice, PageHeader } from "@/features/admin/shared/components/ui";

export function UsersAdmin() {
  const queryClient = useQueryClient();
  const { data: principal } = usePrincipal();
  const canManage = hasPermission(principal ?? null, "users.manage");

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<string[]>(["editor"]);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const users = useQuery({ queryKey: ["admin", "users", { search }], queryFn: () => listUsers({ search, per_page: "100" }) });
  const rolesQuery = useQuery({ queryKey: ["admin", "roles"], queryFn: listRoles });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const create = useMutation({
    mutationFn: () => createUser({ name, email, roles }),
    onSuccess: (result) => {
      setTempPassword(result.temporaryPassword);
      setCreateOpen(false);
      setName("");
      setEmail("");
      invalidate();
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setUserActive(id, active),
    onSuccess: invalidate,
  });

  const revoke = useMutation({
    mutationFn: revokeUserSessions,
    onSuccess: () => setRevokeTarget(null),
  });

  const remove = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      setDeleteTarget(null);
      invalidate();
    },
  });

  const changeRoles = useMutation({
    mutationFn: ({ id, name: userName, email: userEmail, nextRoles }: { id: string; name: string; email: string; nextRoles: string[] }) =>
      updateUser(id, { name: userName, email: userEmail, roles: nextRoles }),
    onSuccess: invalidate,
  });

  const columns: Column<AdminUser>[] = [
    { key: "name", header: "Name", sortable: true, mobile: "primary", sortValue: (user) => user.name, cell: (user) => <span className="font-semibold text-ink">{user.name}</span> },
    { key: "email", header: "Email", sortable: true, sortValue: (user) => user.email, cell: (user) => <span className="text-muted">{user.email}</span> },
    {
      key: "roles",
      header: "Roles",
      sortable: true,
      sortValue: (user) => user.roles.join(","),
      mobile: "hidden",
      cell: (user) => (
        <select
          aria-label={`Roles for ${user.name}`}
          className={inputClass}
          multiple
          value={user.roles}
          size={Math.min(4, Math.max((rolesQuery.data ?? []).length, 1))}
          onChange={(event) => {
            const nextRoles = [...event.target.selectedOptions].map((option) => option.value);
            changeRoles.mutate({ id: user.id, name: user.name, email: user.email, nextRoles });
          }}
        >
          {(rolesQuery.data ?? []).map((role) => (
            <option key={role.name} value={role.name}>
              {role.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      sortValue: (user) => (user.is_active ? 1 : 0),
      cell: (user) => <Badge tone={user.is_active ? "success" : "danger"}>{user.is_active ? "active" : "disabled"}</Badge>,
    },
    { key: "mfa", header: "MFA", cell: (user) => <span className="text-muted">{user.mfa_enabled ? "Enrolled" : "Not enrolled"}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users and roles"
        description="Provision accounts, assign roles and revoke access."
        actions={
          canManage ? (
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus aria-hidden className="size-4" /> New user
            </Button>
          ) : null
        }
      />

      {tempPassword ? (
        <Notice>
          Account created. One-time temporary password: <span className="font-mono">{tempPassword}</span> — share it securely; the user
          must change it on first sign in.
        </Notice>
      ) : null}

      <DataTable<AdminUser>
        rows={users.data?.data ?? []}
        columns={columns}
        getRowId={(user) => user.id}
        loading={users.isLoading}
        error={users.isError ? "Users could not be loaded." : null}
        onRetry={() => users.refetch()}
        emptyIcon={Users}
        emptyTitle="No accounts yet"
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search name, email or role",
          filterFn: (user, term) => `${user.name} ${user.email} ${user.roles.join(" ")}`.toLowerCase().includes(term),
        }}
        actions={
          canManage
            ? (user) => (
                <div className="flex items-center justify-end gap-1">
                  <IconButton
                    label={user.is_active ? "Disable account" : "Enable account"}
                    icon={user.is_active ? UserX : UserCheck}
                    size="sm"
                    disabled={toggleActive.isPending}
                    onClick={() => toggleActive.mutate({ id: user.id, active: !user.is_active })}
                  />
                  <IconButton label="Revoke sessions" icon={KeyRound} size="sm" disabled={revoke.isPending} onClick={() => setRevokeTarget(user)} />
                  {user.id !== principal?.id ? (
                    <IconButton
                      label="Delete user"
                      icon={Trash2}
                      size="sm"
                      disabled={remove.isPending}
                      onClick={() => setDeleteTarget(user)}
                    />
                  ) : null}
                </div>
              )
            : undefined
        }
      />

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New user"
        description="The user receives a one-time temporary password and must change it on first sign in."
        footer={
          <>
            <Button type="button" variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="create-user-form" size="sm" disabled={!name || !email || roles.length === 0 || create.isPending}>
              {create.isPending ? "Creating..." : "Create account"}
            </Button>
          </>
        }
      >
        <form
          id="create-user-form"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate();
          }}
        >
          <Field label="Name" htmlFor="user-name" required>
            <input id="user-name" data-autofocus className={inputClass} value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field label="Email" htmlFor="user-email" required>
            <input id="user-email" type="email" className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold text-ink">Roles</legend>
            <div className="flex flex-wrap gap-3">
              {(rolesQuery.data ?? []).map((role) => (
                <label key={role.name} className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={roles.includes(role.name)}
                    onChange={(event) =>
                      setRoles((current) => (event.target.checked ? [...current, role.name] : current.filter((value) => value !== role.name)))
                    }
                  />
                  {role.label}
                </label>
              ))}
            </div>
          </fieldset>
        </form>
      </Modal>

      <ConfirmDialog
        open={revokeTarget !== null}
        onClose={() => setRevokeTarget(null)}
        onConfirm={() => revokeTarget && revoke.mutate(revokeTarget.id)}
        title="Revoke active sessions?"
        description={revokeTarget ? `${revokeTarget.name} will be signed out of all devices immediately.` : undefined}
        confirmLabel="Revoke sessions"
        pending={revoke.isPending}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        title="Delete user?"
        description={
          deleteTarget
            ? `${deleteTarget.name} will be permanently deleted along with their sessions and recovery codes. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete user"
        pending={remove.isPending}
      />
    </div>
  );
}
