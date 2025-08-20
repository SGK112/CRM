import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'route_permissions';
export const RequiresPermissions = (...perms: string[]) => SetMetadata(PERMISSIONS_KEY, perms);
