import { describe, expect, it } from 'vitest';
import type { ConditionNode, FilterNode, GroupNode } from '../core/types';
import { filterReducer } from './reducer';

const makeCondition = (id: string, overrides: Partial<ConditionNode> = {}) => ({
  id,
  kind: 'condition',
  fieldId: '',
  operator: '',
  ...overrides,
} satisfies ConditionNode);

const makeGroup = (
  id: string,
  children: FilterNode[] = [],
  overrides: Partial<GroupNode> = {}
) => ({
  id,
  kind: 'group',
  combinator: 'AND',
  children,
  ...overrides,
} satisfies GroupNode);

const findGroupById = (node: FilterNode, id: string): GroupNode | null => {
  if (node.kind === 'group') {
    if (node.id === id) return node;

    for (const child of node.children) {
      const match = findGroupById(child, id);
      if (match) return match;
    }
  }

  return null;
};

describe('filterReducer', () => {
  it('adds a condition to the target group without mutating the original state', () => {
    const root = makeGroup('root', [makeCondition('initial')]);

    const next = filterReducer(root, {
      type: 'ADD_CONDITION',
      groupId: 'root',
    });

    expect(next).not.toBe(root);

    const nextRoot = next as GroupNode;
    expect(nextRoot.children).toHaveLength(2);
    expect(nextRoot.children.at(-1)?.kind).toBe('condition');

    expect(root.children).toHaveLength(1);
    expect(root.children[0]).toEqual(makeCondition('initial'));
  });

  it('adds a group after a specified sibling', () => {
    const root = makeGroup('root', [
      makeCondition('first'),
      makeGroup('existing-group'),
    ]);

    const next = filterReducer(root, {
      type: 'ADD_GROUP',
      groupId: 'root',
      afterId: 'first',
    });

    const nextRoot = next as GroupNode;
    expect(nextRoot.children).toHaveLength(3);
    expect(nextRoot.children[1].kind).toBe('group');
    expect((nextRoot.children[1] as GroupNode).id).not.toBe('existing-group');
    expect(nextRoot.children[2]).toEqual(makeGroup('existing-group'));

    expect(root.children[1]).toEqual(makeGroup('existing-group'));
  });

  it('removes a node when a parent exists and leaves original state untouched', () => {
    const root = makeGroup('root', [
      makeCondition('keep'),
      makeCondition('drop'),
    ]);

    const next = filterReducer(root, {
      type: 'REMOVE_NODE',
      nodeId: 'drop',
    });

    const nextRoot = next as GroupNode;
    expect(nextRoot.children).toHaveLength(1);
    expect(nextRoot.children[0].id).toBe('keep');
    expect(root.children).toHaveLength(2);
  });

  it('moves a node to a target group and preserves ordering', () => {
    const destination = makeGroup('destination', [makeCondition('existing-destination')]);
    const root = makeGroup('root', [
      makeCondition('root-condition'),
      makeGroup('source-group', [makeCondition('to-move')]),
      destination,
    ]);

    const next = filterReducer(root, {
      type: 'MOVE_NODE',
      nodeId: 'to-move',
      targetGroupId: 'destination',
      afterId: 'existing-destination',
    });

    const nextDestination = findGroupById(next, 'destination');
    expect(nextDestination).not.toBeNull();
    expect(nextDestination?.children.map((child) => child.id)).toEqual([
      'existing-destination',
      'to-move',
    ]);

    const nextSource = findGroupById(next, 'source-group');
    expect(nextSource?.children).toHaveLength(0);

    const originalSource = findGroupById(root, 'source-group');
    expect(originalSource?.children).toHaveLength(1);
  });

  it('prevents moving a group into its own descendant', () => {
    const nestedChild = makeGroup('nested');
    const parent = makeGroup('parent', [nestedChild]);
    const root = makeGroup('root', [parent]);

    const next = filterReducer(root, {
      type: 'MOVE_NODE',
      nodeId: 'parent',
      targetGroupId: 'nested',
    });

    expect(next).toBe(root);
  });

  it('updates a condition with the provided fields', () => {
    const root = makeGroup('root', [
      makeCondition('condition', {
        fieldId: 'name',
        operator: 'eq',
        value: 'John',
      }),
    ]);

    const next = filterReducer(root, {
      type: 'UPDATE_CONDITION',
      nodeId: 'condition',
      fieldId: 'status',
      operator: 'neq',
      value: 'inactive',
    });

    const updated = findGroupById(next, 'root')?.children[0] as ConditionNode;
    expect(updated.fieldId).toBe('status');
    expect(updated.operator).toBe('neq');
    expect(updated.value).toBe('inactive');

    const originalCondition = root.children[0] as ConditionNode;
    expect(originalCondition.fieldId).toBe('name');
    expect(originalCondition.operator).toBe('eq');
    expect(originalCondition.value).toBe('John');
  });

  it('updates a group combinator', () => {
    const root = makeGroup('root', [makeGroup('child')]);

    const next = filterReducer(root, {
      type: 'UPDATE_GROUP',
      groupId: 'root',
      combinator: 'OR',
    });

    const nextRoot = next as GroupNode;
    expect(nextRoot.combinator).toBe('OR');
    expect(root.combinator).toBe('AND');
  });
});
