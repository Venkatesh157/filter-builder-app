export type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'enum';
export type Combinator = 'AND' | 'OR';

export type OperatorValueShape = 'none' | 'single' | 'pair' | 'list';

export interface OperatorDef {
  id: string;
  label: string;
  valueShape: OperatorValueShape;
  coerce?: (raw: unknown) => unknown;
}

export interface FieldOption {
  value: string;
  label: string;
}

export type Field = {
  id: string;
  label: string;
  type: FieldType;
  operators: OperatorDef[];
  options?: FieldOption[];
};

export type ConditionNode = {
  id: string;
  kind: 'condition';
  fieldId: string;
  operator: string;
  value?: unknown | unknown[];
};

export type GroupNode = {
  id: string;
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
    valueShape: 'single',
  },
  neq: {
    id: 'neq',
    label: 'Does Not Equal',
    valueShape: 'single',
  },
  gt: {
    id: 'gt',
    label: 'Greater Than',
    valueShape: 'single',
  },
  lt: {
    id: 'lt',
    label: 'Less Than',
    valueShape: 'single',
  },
  between: {
    id: 'between',
    label: 'Between',
    valueShape: 'pair',
  },
  contains: {
    id: 'contains',
    label: 'Contains',
    valueShape: 'single',
  },
  starts_with: {
    id: 'starts_with',
    label: 'Starts with',
    valueShape: 'single',
  },
  ends_with: {
    id: 'ends_with',
    label: 'Ends with',
    valueShape: 'single',
  },
  is_true: {
    id: 'is_true',
    label: 'Is True',
    valueShape: 'none',
  },
  is_false: {
    id: 'is_false',
    label: 'Is False',
    valueShape: 'none',
  },
  before: { id: 'before', label: 'Before', valueShape: 'single' },
  after: { id: 'after', label: 'After', valueShape: 'single' },
  in: { id: 'in', label: 'In', valueShape: 'list' },
  not_in: { id: 'not_in', label: 'Not In', valueShape: 'list' },
  is_null: { id: 'is_null', label: 'Is Null', valueShape: 'none' },
  is_not_null: {
    id: 'is_not_null',
    label: 'Is Not Null',
    valueShape: 'none',
  },
} satisfies Record<string, OperatorDef>;

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  path: string[];
  message: string;
  severity: ValidationSeverity;
}
