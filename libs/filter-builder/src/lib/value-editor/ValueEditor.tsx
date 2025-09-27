import { useEffect, useMemo } from 'react';
import type { ChangeEvent } from 'react';

import { useFilterBuilder } from '../field-builder-context/FilterBuilderContext';
import type { FieldType } from '../../core/types';

const joinClassNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

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
  className?: string;
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
  className,
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

  const listValues = useMemo(() => {
    if (Array.isArray(value)) {
      return value;
    }
    if (value === undefined || value === null) {
      return [];
    }
    return [value];
  }, [value]);

  // Ensure we clear values for operators that should not hold data.
  useEffect(() => {
    if (!field || !operator) return;
    if (operator.valueShape === 'none' && value !== undefined && value !== null) {
      onChange?.(undefined);
    }
  }, [field, operator, value, onChange]);

  const aria = ariaLabel ?? placeholder;
  const isDisabled = disabled || !field || !operator;

  const coerce = (next: unknown) =>
    operator?.coerce ? operator.coerce(next) : next;

  const selectClassName = joinClassNames(
    'w-full min-w-[8rem] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:cursor-not-allowed disabled:opacity-60',
    isDisabled && 'cursor-not-allowed',
    className
  );

  const inputClassName = joinClassNames(
    'w-full min-w-[8rem] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:cursor-not-allowed disabled:opacity-60',
    isDisabled && 'cursor-not-allowed',
    className
  );

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
        className={inputClassName}
      />
    );
  }

  const shape = operator.valueShape;

  if (shape === 'none') {
    return null;
  }

  if (shape === 'single') {
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
          className={selectClassName}
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
          className={selectClassName}
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
        className={inputClassName}
      />
    );
  }

  if (shape === 'pair') {
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

    const inputTypeForTuple = (() => {
      switch (field.type) {
        case 'number':
          return 'number';
        case 'date':
          return 'date';
        default:
          return 'text';
      }
    })();

    return (
      <span
        role="group"
        aria-label={aria}
        className="flex w-full flex-wrap items-center gap-2"
      >
        <input
          id={id ? `${id}-start` : undefined}
          name={name ? `${name}[0]` : undefined}
          type={inputTypeForTuple}
          value={stringTuple[0]}
          onChange={(event) => handleTupleChange(0, event)}
          disabled={isDisabled}
          placeholder={placeholder}
          aria-label={`${aria} start`}
          className={inputClassName}
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
          className={inputClassName}
        />
      </span>
    );
  }

  const serializedList = listValues
    .map((entry) => (entry === undefined || entry === null ? '' : String(entry)))
    .join('\n');

  const handleListChange = ({ currentTarget }: ChangeEvent<HTMLTextAreaElement>) => {
    const entries = currentTarget.value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => parseFromInput(line, field.type));

    onChange?.(coerce(entries));
  };

  return (
    <textarea
      id={id}
      name={name}
      value={serializedList}
      onChange={handleListChange}
      disabled={isDisabled}
      placeholder={`${placeholder} (one per line)`}
      aria-label={aria}
      className={joinClassNames(
        'h-28 w-full min-w-[10rem] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:cursor-not-allowed disabled:opacity-60',
        isDisabled && 'cursor-not-allowed',
        className
      )}
    />
  );
}

export default ValueEditor;
