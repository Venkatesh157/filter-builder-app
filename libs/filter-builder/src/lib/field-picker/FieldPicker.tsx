import type { ChangeEvent } from 'react';

import { useFieldOptions } from '../hooks';

const joinClassNames = (
  ...classes: Array<string | false | null | undefined>
) => classes.filter(Boolean).join(' ');

export interface FieldPickerProps {
  fieldId?: string | null;
  onChange?: (next: string | null) => void;
  id?: string;
  name?: string;
  'aria-label'?: string;
  disabled?: boolean;
  placeholderLabel?: string;
  className?: string;
}

const defaultPlaceholder = 'Select field';

export function FieldPicker({
  fieldId,
  onChange,
  id,
  name,
  disabled,
  placeholderLabel = defaultPlaceholder,
  'aria-label': ariaLabel,
  className,
}: FieldPickerProps) {
  const options = useFieldOptions();
  const value = fieldId ?? '';

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.currentTarget.value || null;
    onChange?.(next);
  };

  const selectClassName = joinClassNames(
    'w-full min-w-[10rem] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:cursor-not-allowed disabled:opacity-60',
    className
  );

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      aria-label={ariaLabel ?? placeholderLabel}
      className={selectClassName}
    >
      <option value="">{placeholderLabel}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default FieldPicker;
