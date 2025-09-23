export type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'enum';
export type Combinator = 'AND' | 'OR';

export type OperatorDef = {
  id: string;
  label: string;
  arity: 0 | 1 | 2;
  coerce?: (raw: unknown) => unknown;
};

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
  root: GroupNode;
}
