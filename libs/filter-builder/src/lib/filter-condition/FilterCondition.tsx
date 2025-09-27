import type { ReactNode } from 'react';

import { useFilterBuilder } from '../field-builder-context/FilterBuilderContext';
import FieldPicker, {
  type FieldPickerProps,
} from '../field-picker/FieldPicker';
import OperatorPicker, {
  type OperatorPickerProps,
} from '../operator-picker/OperatorPicker';
import ValueEditor, {
  type ValueEditorProps,
} from '../value-editor/ValueEditor';
import type { ConditionNode } from '../../core/types';

const joinClassNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export interface FilterConditionProps {
  condition: ConditionNode;
  className?: string;
  disableRemove?: boolean;
  removeLabel?: string;
  onRemove?: (conditionId: string) => void;
  fieldPickerProps?: Omit<FieldPickerProps, 'fieldId' | 'onChange'>;
  operatorPickerProps?: Omit<
    OperatorPickerProps,
    'fieldId' | 'operatorId' | 'onChange'
  >;
  valueEditorProps?: Omit<
    ValueEditorProps,
    'fieldId' | 'operatorId' | 'value' | 'onChange'
  >;
  renderActions?: (actions: { remove: () => void }) => ReactNode;
}

const defaultRemoveLabel = 'Remove condition';

export function FilterCondition({
  condition,
  className,
  disableRemove,
  removeLabel = defaultRemoveLabel,
  onRemove,
  fieldPickerProps,
  operatorPickerProps,
  valueEditorProps,
  renderActions,
}: FilterConditionProps) {
  const { dispatch, schema, issues } = useFilterBuilder();

  const { className: fieldPickerClassName, ...fieldPickerRest } =
    fieldPickerProps ?? {};
  const resolvedFieldPickerClass = joinClassNames(
    'flex-1 min-w-[12rem]',
    fieldPickerClassName
  );

  const { className: operatorPickerClassName, ...operatorPickerRest } =
    operatorPickerProps ?? {};
  const resolvedOperatorClass = joinClassNames(
    'flex-1 min-w-[10rem]',
    operatorPickerClassName
  );

  const { className: valueEditorClassName, ...valueEditorRest } =
    valueEditorProps ?? {};
  const resolvedValueEditorClass = joinClassNames(
    'flex-1 min-w-[12rem]',
    valueEditorClassName
  );

  const removeButtonClass = joinClassNames(
    'inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500/60 disabled:cursor-not-allowed disabled:opacity-60',
    disableRemove && 'cursor-not-allowed'
  );

  const handleFieldChange = (nextFieldId: string | null) => {
    dispatch({
      type: 'UPDATE_CONDITION',
      nodeId: condition.id,
      fieldId: nextFieldId ?? '',
      operator: '',
      value: undefined,
    });
  };

  const handleOperatorChange = (nextOperatorId: string | null) => {
    const nextOperator = nextOperatorId
      ? schema.operators[nextOperatorId]
      : undefined;

    let nextValue: unknown;

    if (nextOperator) {
      switch (nextOperator.valueShape) {
        case 'pair':
          nextValue = [undefined, undefined];
          break;
        case 'list':
          nextValue = [];
          break;
        case 'none':
          nextValue = undefined;
          break;
        default:
          nextValue = undefined;
      }
    }

    dispatch({
      type: 'UPDATE_CONDITION',
      nodeId: condition.id,
      operator: nextOperatorId ?? '',
      value: nextValue,
    });
  };

  const handleValueChange = (nextValue: unknown) => {
    dispatch({
      type: 'UPDATE_CONDITION',
      nodeId: condition.id,
      value: nextValue,
    });
  };

  const handleRemove = () => {
    if (disableRemove) return;

    dispatch({ type: 'REMOVE_NODE', nodeId: condition.id });
    onRemove?.(condition.id);
  };

  const conditionIssues = issues.filter((issue) =>
    issue.path.includes(condition.id)
  );

  return (
    <div className={className} role="group" aria-label="Filter condition">
      <FieldPicker
        fieldId={condition.fieldId || ''}
        onChange={handleFieldChange}
        className={resolvedFieldPickerClass}
        {...fieldPickerRest}
      />

      <OperatorPicker
        fieldId={condition.fieldId || ''}
        operatorId={condition.operator || ''}
        onChange={handleOperatorChange}
        className={resolvedOperatorClass}
        {...operatorPickerRest}
      />

      <ValueEditor
        fieldId={condition.fieldId || ''}
        operatorId={condition.operator || ''}
        value={condition.value}
        onChange={handleValueChange}
        className={resolvedValueEditorClass}
        {...valueEditorRest}
      />

      {renderActions ? (
        renderActions({ remove: handleRemove })
      ) : (
        <button
          type="button"
          onClick={handleRemove}
          disabled={Boolean(disableRemove)}
          aria-label={removeLabel}
          className={removeButtonClass}
        >
          Remove
        </button>
      )}

      {conditionIssues.length > 0 && (
        <ul
          aria-live="polite"
          className="mt-2 w-full space-y-1 rounded-md bg-rose-50 p-2 text-sm text-rose-700"
        >
          {conditionIssues.map((issue, index) => (
            <li
              key={`${condition.id}-issue-${index}`}
              role={issue.severity === 'error' ? 'alert' : 'status'}
            >
              {issue.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FilterCondition;
