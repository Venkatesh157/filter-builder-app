export type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'enum';
export type Combinator = 'AND' | 'OR';

export interface OperatorDef {
  id: string;
  label: string;
  arity: 0 | 1 | 2;
  coerce?: (raw: unknown) => unknown;
}

export type Field = {
  id: string;
  label: string;
  type: FieldType;
  operators: OperatorDef[];
};

export type ConditionNode = {
  kind: 'condition';
  fieldId: string;
  operator: string;
  value?: unknown | unknown[];
};

export type GroupNode = {
  kind: 'group';
  combinator: Combinator;
  children: Array<ConditionNode | GroupNode>;
};

export type FilterNode = ConditionNode | GroupNode;

export interface NormalizedSchema {
  fields: Record<string, Field>;
  operators: Record<string, OperatorDef>;
  root: GroupNode;
}

export const BASE_OPERATORS = {
  eq: {
    id: 'eq',
    label: 'Equals',
    arity: 1,
  },
  neq: {
    id: 'neq',
    label: 'Does Not Equal',
    arity: 1,
  },
  gt: {
    id: 'gt',
    label: 'Greater Than',
    arity: 1,
  },
  lt: {
    id: 'lt',
    label: 'Less Than',
    arity: 1,
  },
  between: {
    id: 'between',
    label: 'Between',
    arity: 2,
  },
  contains: {
    id: 'contains',
    label: 'Contains',
    arity: 1,
  },
  starts_with: {
    id: 'starts_with',
    label: 'Starts with',
    arity: 1,
  },
  ends_with: {
    id: 'ends_with',
    label: 'Ends with',
    arity: 1,
  },
  is_true: {
    id: 'is_true',
    label: 'Is True',
    arity: 0,
  },
  is_false: {
    id: 'is_false',
    label: 'Is False',
    arity: 0,
  },
  before: { id: 'before', label: 'Before', arity: 1 },
  after: { id: 'after', label: 'After', arity: 1 },
} satisfies Record<string, OperatorDef>;

export function normalizeSchema(rawFields: Field[]) {
  const fieldsById: Record<string, Field> = {};
  const operatorsById: Record<string, OperatorDef> = {};

  for (const field of rawFields) {
    fieldsById[field.id] = field;

    for (const operator of field.operators) {
      const existing = operatorsById[operator.id];

      if (existing) {
        if (
          existing.label !== operator.label ||
          existing.arity !== operator.arity
        ) {
          throw new Error(`Operator mismatch for ${operator.id}`);
        }
      } else {
        operatorsById[operator.id] = operator;
      }
    }
  }

  for (const field of rawFields) {
    for (const operator of field.operators) {
      if (!operatorsById[operator.id]) {
        throw new Error(`Unknown operator ${operator.id} on field ${field.id}`);
      }
    }
  }

  return {
    fields: fieldsById,
    operators: operatorsById,
    root: {
      kind: 'group',
      combinator: 'AND',
      children: [],
    },
  };
}
