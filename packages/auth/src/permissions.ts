import type { AbilityBuilder } from '@casl/ability';
import type { AppAbility } from '.';
import type { User } from './models/user';

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>
) => void;

type Role = 'ADMIN' | 'MEMBER';

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN(_user, builder) {
    const { can } = builder;
    can('manage', 'all');
  },
  MEMBER(_user, builder) {
    const { can } = builder;
    can('invite', 'User');
  },
};
