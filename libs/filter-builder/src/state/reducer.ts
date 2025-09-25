import { FilterNode, GroupNode } from '../core/types';
import { FilterAction } from './actions';
import { condition, deepClone, group } from '../core/node';

const findGroup = (node: FilterNode, groupId: string): GroupNode | null => {
  if (node.kind !== 'group') return null;
  if (node.id === groupId) return node;

  for (const child of node.children) {
    const match = findGroup(child, groupId);
    if (match) return match;
  }

  return null;
};

const findParentGroup = (
  node: FilterNode,
  childId: string
): { group: GroupNode; index: number } | null => {
  if (node.kind !== 'group') return null;

  const index = node.children.findIndex((child) => child.id === childId);
  if (index >= 0) {
    return { group: node, index };
  }

  for (const child of node.children) {
    const parent = findParentGroup(child, childId);
    if (parent) return parent;
  }

  return null;
};

const findNode = (node: FilterNode, nodeId: string): FilterNode | null => {
  if (node.id === nodeId) return node;
  if (node.kind !== 'group') return null;

  for (const child of node.children) {
    const match = findNode(child, nodeId);
    if (match) return match;
  }

  return null;
};

const insertIntoGroup = (
  targetGroup: GroupNode,
  child: FilterNode,
  afterId?: string
) => {
  if (afterId) {
    const idx = targetGroup.children.findIndex((node) => node.id === afterId);
    if (idx >= 0) {
      targetGroup.children.splice(idx + 1, 0, child);
      return;
    }
  }

  targetGroup.children.push(child);
};

export function filterReducer(
  state: FilterNode,
  action: FilterAction
): FilterNode {
  switch (action.type) {
    case 'ADD_CONDITION': {
      const draft = deepClone(state);
      const targetGroup = findGroup(draft, action.groupId);

      if (!targetGroup) {
        return state;
      }

      const newCondition = condition();
      insertIntoGroup(targetGroup, newCondition, action.afterId);

      return draft;
    }
    case 'ADD_GROUP': {
      const draft = deepClone(state);
      const targetGroup = findGroup(draft, action.groupId);

      if (!targetGroup) {
        return state;
      }

      const newGroup = group();
      insertIntoGroup(targetGroup, newGroup, action.afterId);

      return draft;
    }
    case 'REMOVE_NODE': {
      if (state.id === action.nodeId) {
        return state;
      }

      const draft = deepClone(state);
      const parentInfo = findParentGroup(draft, action.nodeId);

      if (!parentInfo) {
        return state;
      }

      parentInfo.group.children.splice(parentInfo.index, 1);

      return draft;
    }
    case 'MOVE_NODE': {
      if (state.id === action.nodeId) {
        return state;
      }

      const draft = deepClone(state);
      const sourceInfo = findParentGroup(draft, action.nodeId);

      if (!sourceInfo) {
        return state;
      }

      const nodeToMove = sourceInfo.group.children[sourceInfo.index];
      const targetGroup = findGroup(draft, action.targetGroupId);

      if (!targetGroup) {
        return state;
      }

      if (nodeToMove.kind === 'group') {
        if (nodeToMove.id === targetGroup.id) {
          return state;
        }

        const targetInsideMoving = findGroup(nodeToMove, action.targetGroupId);
        if (targetInsideMoving) {
          return state;
        }
      }

      sourceInfo.group.children.splice(sourceInfo.index, 1);

      const afterId =
        action.afterId && action.afterId !== nodeToMove.id
          ? action.afterId
          : undefined;

      insertIntoGroup(targetGroup, nodeToMove, afterId);

      return draft;
    }
    case 'UPDATE_CONDITION': {
      const draft = deepClone(state);
      const node = findNode(draft, action.nodeId);

      if (!node || node.kind !== 'condition') {
        return state;
      }

      if (action.fieldId !== undefined) {
        node.fieldId = action.fieldId;
      }

      if (action.operator !== undefined) {
        node.operator = action.operator;
      }

      if (Object.prototype.hasOwnProperty.call(action, 'value')) {
        node.value = action.value;
      }

      return draft;
    }
    case 'UPDATE_GROUP': {
      const draft = deepClone(state);
      const targetGroup = findGroup(draft, action.groupId);

      if (!targetGroup) {
        return state;
      }

      targetGroup.combinator = action.combinator;

      return draft;
    }
    default:
      return state;
  }
}
