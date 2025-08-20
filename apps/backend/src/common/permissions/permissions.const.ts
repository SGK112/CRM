// Central definitions for role enums and permission mapping
export type AppRole = 'owner' | 'admin' | 'sales_associate' | 'project_manager' | 'team_member' | 'client';

// Define granular permission slugs
export type Permission =
  | 'employees.read'
  | 'employees.create'
  | 'employees.update'
  | 'employees.delete'
  | 'employees.manage.nested'
  | 'invitations.create'
  | 'invitations.read'
  | 'invitations.delete'
  | 'workspace.usage.read'
  | 'workspace.settings.update'
  | 'estimates.read'
  | 'estimates.create'
  | 'estimates.manage'
  | 'invoices.read'
  | 'invoices.create'
  | 'invoices.manage'
  | 'payments.record'
  | 'media.upload'
  | 'media.read'
  | 'share.create'
  | 'ai.tokens.read'
  | 'ai.tokens.purchase'
  | 'ai.tokens.consume';

// Role -> permissions matrix (owner inherits all; avoid deep inheritance for simplicity)
export const rolePermissions: Record<AppRole, Permission[]> = {
  owner: [
    'employees.read','employees.create','employees.update','employees.delete','employees.manage.nested',
  'invitations.create','invitations.read','invitations.delete','workspace.usage.read','workspace.settings.update',
  'estimates.read','estimates.create','estimates.manage',
    'invoices.read','invoices.create','invoices.manage','payments.record',
  'media.upload','media.read','share.create',
  'ai.tokens.read','ai.tokens.purchase','ai.tokens.consume'
  ],
  admin: [
    'employees.read','employees.create','employees.update','employees.delete','employees.manage.nested',
  'invitations.create','invitations.read','workspace.usage.read','workspace.settings.update',
  'estimates.read','estimates.create','estimates.manage',
    'invoices.read','invoices.create','invoices.manage','payments.record',
  'media.upload','media.read','share.create',
  'ai.tokens.read','ai.tokens.purchase','ai.tokens.consume'
  ],
  project_manager: [
  'employees.read','employees.create','employees.update','employees.manage.nested',
  'estimates.read','estimates.create','estimates.manage',
    'invoices.read',
  'media.read','ai.tokens.read'
  ],
  sales_associate: [
  'employees.read',
    'estimates.read','estimates.create',
  'media.read','ai.tokens.read'
  ],
  team_member: [
  'employees.read','estimates.read',
  'media.read','ai.tokens.read'
  ],
  client: [
    // intentionally minimal
  ],
};

export function hasPermission(role: AppRole | undefined, perm: Permission): boolean {
  if (!role) return false;
  if (role === 'owner') return true; // fast path
  const allowed = rolePermissions[role];
  return allowed?.includes(perm) || false;
}
