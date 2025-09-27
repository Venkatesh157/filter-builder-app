import type { ChangeEvent } from 'react';

import { useOperators } from '../hooks';

const joinClassNames = (
  ...classes: Array<string | false | null | undefined>
) => classes.filter(Boolean).join(' ');

export interface OperatorPickerProps {
  operatorId?: string | null;
  fieldId?: string | null;
  onChange: (next: string | null) => void;
  id?: string;
  name?: string;
  'aria-label'?: string;
  disabled?: boolean;
  placeholderLabel?: string;
  className?: string;
}
const defaultPlaceholder = 'Select Operator';

function OperatorPicker({
  operatorId,
  fieldId,
  onChange,
  id,
  name,
  disabled,
  placeholderLabel = defaultPlaceholder,
  'aria-label': ariaLabel,
  className,
}: OperatorPickerProps) {
  const operators = useOperators(fieldId ?? undefined);
  const value = operatorId ?? '';

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value || null;
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
      {operators.map((operator) => (
        <option key={operator.id} value={operator.id}>
          {operator.label}
        </option>
      ))}
    </select>
  );
}

export default OperatorPicker;
