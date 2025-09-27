import { cache } from 'react';

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
          { id: 'contains', label: 'Contains', arity: 1 },
          { id: 'starts_with', label: 'Starts with', arity: 1 },
          { id: 'eq', label: 'Equals', arity: 1 },
        ],
      },
    },
    {
      path: 'email',
      field: {
        id: 'email',
        label: 'Email',
        type: 'string',
        operators: [
          { id: 'contains', label: 'Contains', arity: 1 },
          { id: 'eq', label: 'Equals', arity: 1 },
        ],
      },
    },
    {
      path: 'role',
      field: {
        id: 'role',
        label: 'Role',
        type: 'enum',
        options: uniqueRoles.map((role) => ({ value: role, label: role })),
        operators: [
          { id: 'eq', label: 'Equals', arity: 1 },
          { id: 'neq', label: 'Does Not Equal', arity: 1 },
        ],
      },
    },
    {
      path: 'id',
      field: {
        id: 'id',
        label: 'User ID',
        type: 'number',
        operators: [
          { id: 'eq', label: 'Equals', arity: 1 },
          { id: 'gt', label: 'Greater Than', arity: 1 },
          { id: 'lt', label: 'Less Than', arity: 1 },
          { id: 'between', label: 'Between', arity: 2 },
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
          { id: 'before', label: 'Before', arity: 1 },
          { id: 'after', label: 'After', arity: 1 },
          { id: 'between', label: 'Between', arity: 2 },
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
          { id: 'before', label: 'Before', arity: 1 },
          { id: 'after', label: 'After', arity: 1 },
          { id: 'between', label: 'Between', arity: 2 },
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

