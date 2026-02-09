"use client";

import { getPermissions, type Permissions } from "@/lib/permissions";
import { useUserRole } from "@/contexts/UserRoleContext";

/**
 * Reusable permission checks for role-based UI guarding.
 * Use in any component under UserRoleProvider.
 */
export function usePermissions(): Permissions {
  const { role } = useUserRole();
  return getPermissions(role);
}
