import { Combinator } from '../core/types';

export type FilterAction =
  | { type: 'ADD_CONDITION'; groupId: string; afterId?: string }
  | { type: 'ADD_GROUP'; groupId: string; afterId?: string }
  | { type: 'REMOVE_NODE'; nodeId: string }
  | {
      type: 'MOVE_NODE';
      nodeId: string;
      targetGroupId: string;
      afterId?: string;
    }
  | {
      type: 'UPDATE_CONDITION';
      nodeId: string;
      fieldId?: string;
      operator?: string;
      value?: unknown;
    }
  | { type: 'UPDATE_GROUP'; groupId: string; combinator: Combinator };
