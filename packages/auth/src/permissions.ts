import type { AbilityBuilder } from '@casl/ability';
import type { AppAbility } from '.';
import type { User } from './models/user';
import type { Role } from './roles';

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>
) => void;

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN(_user, builder) {
    const { can } = builder;
    can('manage', 'all');
  },
  MEMBER(_user, builder) {
    const { can } = builder;
    // can('invite', 'User');
    can('create', 'Project');
  },
  BILLING(_user, builder) {
    const { can } = builder;
    can('create', 'Project');
  },
};
