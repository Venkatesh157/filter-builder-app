'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  FilterBuilder,
  type FilterNode,
} from 'json-filter-builder';

import type { User, UserFieldConfig } from './user-types';

type UserFilterClientProps = {
  users: User[];
  fieldConfig: UserFieldConfig[];
};

const joinClassNames = (
  ...classes: Array<string | false | null | undefined>
) => classes.filter(Boolean).join(' ');

const getValueByPath = (item: User, path: string) => {
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc === null || acc === undefined) return undefined;
    if (typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[segment];
  }, item);
};

const isGroupNode = (node: FilterNode): node is Extract<FilterNode, { kind: 'group' }> =>
  node.kind === 'group';

function parseDateValue(raw: unknown): number | null {
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

function evaluateNode(
  node: FilterNode,
  user: User,
  fieldMap: Map<string, UserFieldConfig>
): boolean {
  if (isGroupNode(node)) {
    if (node.children.length === 0) {
      return true;
    }

    const results = node.children.map((child) =>
      evaluateNode(child, user, fieldMap)
    );

    return node.combinator === 'AND'
      ? results.every(Boolean)
      : results.some(Boolean);
  }

  const fieldMeta = fieldMap.get(node.fieldId);
  if (!fieldMeta) {
    return true;
  }

  const actual = getValueByPath(user, fieldMeta.path);
  const operatorId = node.operator;
  const value = node.value;

  if (operatorId === 'eq') {
    if (value === undefined || value === null || value === '') return true;
    return actual === value;
  }

  if (operatorId === 'neq') {
    if (value === undefined || value === null || value === '') return true;
    return actual !== value;
  }

  if (operatorId === 'contains' || operatorId === 'starts_with') {
    if (typeof value !== 'string' || value.trim() === '') return true;
    if (typeof actual !== 'string') return false;
    const haystack = actual.toLowerCase();
    const needle = value.toLowerCase();

    return operatorId === 'contains'
      ? haystack.includes(needle)
      : haystack.startsWith(needle);
  }

  if (operatorId === 'gt' || operatorId === 'lt') {
    if (typeof actual !== 'number') return false;
    if (typeof value !== 'number') return true;
    return operatorId === 'gt' ? actual > value : actual < value;
  }

  if (operatorId === 'between') {
    if (!Array.isArray(value)) return true;
    const [start, end] = value as Array<unknown>;

    if (typeof actual === 'number') {
      const lower =
        typeof start === 'number' ? start : Number.NEGATIVE_INFINITY;
      const upper = typeof end === 'number' ? end : Number.POSITIVE_INFINITY;
      return actual >= lower && actual <= upper;
    }

    if (typeof actual === 'string') {
      const actualTimestamp = parseDateValue(actual);
      const startTimestamp = parseDateValue(start);
      const endTimestamp = parseDateValue(end);

      if (actualTimestamp === null) return false;
      const lower = startTimestamp ?? Number.NEGATIVE_INFINITY;
      const upper = endTimestamp ?? Number.POSITIVE_INFINITY;

      return actualTimestamp >= lower && actualTimestamp <= upper;
    }

    return false;
  }

  if (operatorId === 'before' || operatorId === 'after') {
    if (typeof actual !== 'string') return false;
    const actualTimestamp = parseDateValue(actual);
    const targetTimestamp = parseDateValue(value);
    if (actualTimestamp === null || targetTimestamp === null) return true;
    return operatorId === 'before'
      ? actualTimestamp < targetTimestamp
      : actualTimestamp > targetTimestamp;
  }

  return true;
}

const filterUsers = (
  state: FilterNode | null,
  users: User[],
  fieldConfig: UserFieldConfig[]
): User[] => {
  if (!state) return users;
  if (isGroupNode(state) && state.children.length === 0) {
    return users;
  }

  const fieldMap = new Map(
    fieldConfig.map((config) => [config.field.id, config] as const)
  );

  return users.filter((user) => evaluateNode(state, user, fieldMap));
};

function UsersResult({ users }: { users: User[] }) {
  if (users.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white/80 p-6 text-center text-sm text-slate-500">
        No users match the current filters.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {users.map((user) => (
        <li
          key={user.id}
          className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={`${user.name} avatar`}
                className="h-12 w-12 rounded-full border border-slate-200 object-cover"
              />
            ) : null}
            <div>
              <p className="text-base font-semibold text-slate-800">
                {user.name}
              </p>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-2 text-sm text-slate-600">
            <div>
              <dt className="font-medium text-slate-500">Role</dt>
              <dd className="capitalize">{user.role}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">User ID</dt>
              <dd>{user.id}</dd>
            </div>
            {user.creationAt ? (
              <div>
                <dt className="font-medium text-slate-500">Created</dt>
                <dd>{new Date(user.creationAt).toLocaleDateString()}</dd>
              </div>
            ) : null}
            {user.updatedAt ? (
              <div>
                <dt className="font-medium text-slate-500">Updated</dt>
                <dd>{new Date(user.updatedAt).toLocaleDateString()}</dd>
              </div>
            ) : null}
          </dl>
        </li>
      ))}
    </ul>
  );
}

export function UserFilterClient({
  users,
  fieldConfig,
}: UserFilterClientProps) {
  const [state, setState] = useState<FilterNode | null>(null);
  const [queryString, setQueryString] = useState('');

  const fields = useMemo(
    () => fieldConfig.map((config) => config.field),
    [fieldConfig]
  );

  const filteredUsers = useMemo(
    () => filterUsers(state, users, fieldConfig),
    [state, users, fieldConfig]
  );

  const handleChange = useCallback((next: FilterNode) => {
    setState(next);
  }, []);

  const builderClass = joinClassNames(
    'space-y-6',
    filteredUsers.length === 0 && 'pb-2'
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 lg:px-8">
      <FilterBuilder
        fields={fields}
        onChange={handleChange}
        onSerialize={setQueryString}
        className={builderClass}
        emptyState={
          <p className="text-sm text-slate-500">
            Add conditions to focus on specific users.
          </p>
        }
        previewProps={{ className: 'lg:sticky lg:top-6' }}
      />

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-3 text-xs text-indigo-700">
        <span className="font-semibold">Query string:</span>{' '}
        <code className="break-words">{queryString || '—'}</code>
      </div>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
        <header className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Users
          </h2>
          <p className="text-sm text-slate-600">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </header>
        <UsersResult users={filteredUsers} />
      </section>
    </div>
  );
}
