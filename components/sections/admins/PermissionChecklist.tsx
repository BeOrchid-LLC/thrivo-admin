"use client";

import {
  ADMIN_PERMISSION_OPTIONS,
  ADMIN_ROLE_DEFAULT_PERMISSIONS,
  type AdminPermission,
  type AdminRoleV2,
} from "@/lib/contracts";

interface Props {
  role: AdminRoleV2;
  value: AdminPermission[] | null;
  onChange: (value: AdminPermission[] | null) => void;
}

export function PermissionChecklist({ role, value, onChange }: Props) {
  const defaults = ADMIN_ROLE_DEFAULT_PERMISSIONS[role];
  const effective = new Set(value ?? defaults);
  const custom = value !== null;

  const toggle = (permission: AdminPermission) => {
    const next = new Set(effective);
    if (next.has(permission)) next.delete(permission);
    else next.add(permission);
    onChange([...next]);
  };

  return (
    <fieldset className="space-y-3 rounded-md border p-3">
      <legend className="px-1 text-sm font-medium">Permissions</legend>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={!custom}
          onChange={(event) => onChange(event.target.checked ? null : [...defaults])}
          className="mt-0.5"
        />
        <span>
          <span className="block font-medium">Use role defaults</span>
          <span className="text-muted-foreground">
            Role defaults update automatically when the role changes.
          </span>
        </span>
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        {ADMIN_PERMISSION_OPTIONS.map((permission) => (
          <label key={permission.value} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={effective.has(permission.value)}
              disabled={!custom}
              onChange={() => toggle(permission.value)}
            />
            {permission.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
