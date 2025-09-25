import { useEffect, useMemo } from 'react';
import type { ChangeEvent } from 'react';

import { useFilterBuilder } from '../filter-builder';
import type { FieldType } from '../../core/types';

export interface ValueEditorProps {
  fieldId?: string | null;
  operatorId?: string | null;
  value?: unknown;
  onChange?: (next: unknown) => void;
  id?: string;
  name?: string;
  disabled?: boolean;
  placeholder?: string;
  'aria-label'?: string;
}

const defaultPlaceholder = 'Enter value';

const formatForInput = (raw: unknown, fieldType: FieldType): string => {
  if (raw === undefined || raw === null) return '';

  if (fieldType === 'boolean') {
    return raw === true ? 'true' : raw === false ? 'false' : '';
  }

  return String(raw);
};

const parseFromInput = (raw: string, fieldType: FieldType): unknown => {
  if (raw === '') {
    return null;
  }

  switch (fieldType) {
    case 'number': {
      const parsed = Number(raw);
      return Number.isNaN(parsed) ? null : parsed;
    }
    case 'boolean':
      return raw === 'true';
    default:
      return raw;
  }
};

export function ValueEditor({
  fieldId,
  operatorId,
  value,
  onChange,
  id,
  name,
  disabled,
  placeholder = defaultPlaceholder,
  'aria-label': ariaLabel,
}: ValueEditorProps) {
  const { schema } = useFilterBuilder();

  const field = fieldId ? schema.fields[fieldId] : undefined;
  const operator = operatorId ? schema.operators[operatorId] : undefined;

  const tupleValues = useMemo(() => {
    if (Array.isArray(value)) {
      return [value[0], value[1]] as const;
    }
    return [undefined, undefined] as const;
  }, [value]);

  // Ensure we clear values for zero-arity operators.
  useEffect(() => {
    if (!field || !operator) return;
    if (operator.arity === 0) {
      onChange?.(undefined);
    }
  }, [field, operator, onChange]);

  const aria = ariaLabel ?? placeholder;
  const isDisabled = disabled || !field || !operator;

  const coerce = (next: unknown) =>
    operator?.coerce ? operator.coerce(next) : next;

  if (!field || !operator) {
    return (
      <input
        id={id}
        name={name}
        value=""
        onChange={() => undefined}
        disabled
        placeholder={placeholder}
        aria-label={aria}
      />
    );
  }

  if (operator.arity === 0) {
    return null;
  }

  if (operator.arity === 1) {
    if (field.type === 'boolean') {
      const booleanValue =
        value === true ? 'true' : value === false ? 'false' : '';

      const handleBooleanChange = ({
        currentTarget,
      }: ChangeEvent<HTMLSelectElement>) => {
        const next =
          currentTarget.value === '' ? null : currentTarget.value === 'true';
        onChange?.(coerce(next));
      };

      return (
        <select
          id={id}
          name={name}
          value={booleanValue}
          onChange={handleBooleanChange}
          disabled={isDisabled}
          aria-label={aria}
        >
          <option value="">{placeholder}</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }

    if (field.type === 'enum' && field.options?.length) {
      const stringValue = typeof value === 'string' ? value : '';

      const handleEnumChange = ({
        currentTarget,
      }: ChangeEvent<HTMLSelectElement>) => {
        const next = currentTarget.value || null;
        onChange?.(coerce(next));
      };

      return (
        <select
          id={id}
          name={name}
          value={stringValue}
          onChange={handleEnumChange}
          disabled={isDisabled}
          aria-label={aria}
        >
          <option value="">{placeholder}</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    const inputType:
      | 'text'
      | 'number'
      | 'date'
      | 'datetime-local'
      | 'time'
      | 'email'
      | 'tel' = (() => {
      switch (field.type) {
        case 'number':
          return 'number';
        case 'date':
          return 'date';
        default:
          return 'text';
      }
    })();

    const stringValue = formatForInput(value, field.type);

    const handleSingleChange = ({
      currentTarget,
    }: ChangeEvent<HTMLInputElement>) => {
      const parsed = parseFromInput(currentTarget.value, field.type);
      onChange?.(coerce(parsed));
    };

    return (
      <input
        id={id}
        name={name}
        type={inputType}
        value={stringValue}
        onChange={handleSingleChange}
        disabled={isDisabled}
        placeholder={placeholder}
        aria-label={aria}
      />
    );
  }

  const stringTuple: [string, string] = [
    formatForInput(tupleValues[0], field.type),
    formatForInput(tupleValues[1], field.type),
  ];

  const handleTupleChange = (
    index: 0 | 1,
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const parsed = parseFromInput(event.currentTarget.value, field.type);
    const nextTuple: unknown[] = [...tupleValues];
    nextTuple[index] = parsed;
    onChange?.(coerce(nextTuple));
  };

  const inputTypeForTuple = field.type === 'number' ? 'number' : 'text';

  return (
    <span role="group" aria-label={aria}>
      <input
        id={id ? `${id}-start` : undefined}
        name={name ? `${name}[0]` : undefined}
        type={inputTypeForTuple}
        value={stringTuple[0]}
        onChange={(event) => handleTupleChange(0, event)}
        disabled={isDisabled}
        placeholder={placeholder}
        aria-label={`${aria} start`}
      />
      <input
        id={id ? `${id}-end` : undefined}
        name={name ? `${name}[1]` : undefined}
        type={inputTypeForTuple}
        value={stringTuple[1]}
        onChange={(event) => handleTupleChange(1, event)}
        disabled={isDisabled}
        placeholder={placeholder}
        aria-label={`${aria} end`}
      />
    </span>
  );
}

export default ValueEditor;
