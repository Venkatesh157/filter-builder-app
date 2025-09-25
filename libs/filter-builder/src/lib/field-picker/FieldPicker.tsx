import { useFieldOptions } from '../hooks';

export interface FieldPickerProps {
  fieldId?: string | null;
  onChange?: (next: string | null) => void;
  id?: string;
  name?: string;
  'aria-label'?: string;
  disabled?: boolean;
  placeholderLabel?: string;
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
}: FieldPickerProps) {
  const options = useFieldOptions();
  const value = fieldId ?? '';

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.currentTarget.value || null;
    onChange?.(next);
  };

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      aria-label={ariaLabel ?? placeholderLabel}
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
