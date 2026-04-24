/**
 * Returns the first route the current user has view access to,
 * based on their permissions. Falls back to '/system/dashboard'.
 */

interface Permission {
  id: string | number;
  category: string;
  resource: string;
  action: string;
}

interface UserPermissions {
  role: { name: string };
  permissions: Permission[];
}

const NAV_ORDER: Array<{ resource: string; path: string }> = [
  { resource: 'dashboard',  path: '/system/dashboard' },
  { resource: 'workspaces', path: '/system/workspaces' },
  { resource: 'approvals',  path: '/system/approvals' },
  { resource: 'users',      path: '/system/users' },
  { resource: 'billing',    path: '/system/billing' },
  { resource: 'referrals',  path: '/system/referrals' },
  { resource: 'roles',      path: '/system/roles-permissions' },
  { resource: 'appearance', path: '/system/appearance' },
  { resource: 'settings',   path: '/system/settings' },
];

const FALLBACK_ROUTE = '/system/dashboard';

export function getFirstAccessibleRoute(userPermissions: UserPermissions | null | undefined): string {
  if (!userPermissions?.permissions?.length) {
    return FALLBACK_ROUTE;
  }

  const viewableResources = new Set(
    userPermissions.permissions
      .filter((p) => p.action === 'view')
      .map((p) => p.resource)
  );

  for (const { resource, path } of NAV_ORDER) {
    if (viewableResources.has(resource)) {
      return path;
    }
  }

  return FALLBACK_ROUTE;
}
