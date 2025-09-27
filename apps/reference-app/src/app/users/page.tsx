import { cache } from 'react';

import { BASE_OPERATORS } from '@json-filter-builder/filter-builder/schema';

import type { User, UserFieldConfig } from './user-types';
import { UserFilterClient } from './user-filter-client';

const fetchUsers = cache(async (): Promise<User[]> => {
  const response = await fetch('https://api.escuelajs.co/api/v1/users/', {
    next: { revalidate: 600 },
  });

  if (!response.ok) {
    console.error('Failed to load users', response.statusText);
    return [];
  }

  const users = (await response.json()) as User[];
  return users ?? [];
});

const buildFieldConfig = (users: User[]): UserFieldConfig[] => {
  const uniqueRoles = Array.from(new Set(users.map((user) => user.role))).sort(
    (a, b) => a.localeCompare(b)
  );

  return [
    {
      path: 'name',
      field: {
        id: 'name',
        label: 'Name',
        type: 'string',
        operators: [
          BASE_OPERATORS.contains,
          BASE_OPERATORS.starts_with,
          BASE_OPERATORS.eq,
        ],
      },
    },
    {
      path: 'email',
      field: {
        id: 'email',
        label: 'Email',
        type: 'string',
        operators: [BASE_OPERATORS.contains, BASE_OPERATORS.eq],
      },
    },
    {
      path: 'role',
      field: {
        id: 'role',
        label: 'Role',
        type: 'enum',
        options: uniqueRoles.map((role) => ({ value: role, label: role })),
        operators: [BASE_OPERATORS.eq, BASE_OPERATORS.neq],
      },
    },
    {
      path: 'id',
      field: {
        id: 'id',
        label: 'User ID',
        type: 'number',
        operators: [
          BASE_OPERATORS.eq,
          BASE_OPERATORS.gt,
          BASE_OPERATORS.lt,
          BASE_OPERATORS.between,
        ],
      },
    },
    {
      path: 'creationAt',
      field: {
        id: 'creationAt',
        label: 'Created At',
        type: 'date',
        operators: [
          BASE_OPERATORS.before,
          BASE_OPERATORS.after,
          BASE_OPERATORS.between,
        ],
      },
    },
    {
      path: 'updatedAt',
      field: {
        id: 'updatedAt',
        label: 'Updated At',
        type: 'date',
        operators: [
          BASE_OPERATORS.before,
          BASE_OPERATORS.after,
          BASE_OPERATORS.between,
        ],
      },
    },
  ];
};

export default async function UsersPage() {
  const users = await fetchUsers();
  const fieldConfig = buildFieldConfig(users);

  return (
    <main className="min-h-screen bg-slate-100/70">
      <UserFilterClient users={users} fieldConfig={fieldConfig} />
    </main>
  );
}
