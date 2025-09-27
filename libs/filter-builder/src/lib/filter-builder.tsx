import type { ReactNode } from 'react';

import { FilterBuilderProvider } from './field-builder-provider/FilterBuilderProvider';
import { useFilterBuilder } from './field-builder-context/FilterBuilderContext';
import type { FilterBuilderProviderProps } from './field-builder-provider/FilterBuilderProvider';
import { FilterGroup, type FilterGroupProps } from './filter-group/FilterGroup';
import { QueryPreview, type QueryPreviewProps } from './query-preview';

const joinClassNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

interface FilterBuilderShellProps {
  className?: string;
  showPreview?: boolean;
  filterGroupProps?: Omit<FilterGroupProps, 'group' | 'isRoot'>;
  previewProps?: QueryPreviewProps;
  emptyState?: ReactNode;
}

export interface FilterBuilderProps
  extends Omit<FilterBuilderProviderProps, 'children'>,
    FilterBuilderShellProps {}

export function FilterBuilder({
  fields,
  initialState,
  onChange,
  onSerialize,
  debounceMs,
  className,
  showPreview = true,
  filterGroupProps,
  previewProps,
  emptyState,
}: FilterBuilderProps) {
  return (
    <FilterBuilderProvider
      fields={fields}
      initialState={initialState}
      onChange={onChange}
      onSerialize={onSerialize}
      debounceMs={debounceMs}
    >
      <FilterBuilderContent
        className={className}
        showPreview={showPreview}
        filterGroupProps={filterGroupProps}
        previewProps={previewProps}
        emptyState={emptyState}
      />
    </FilterBuilderProvider>
  );
}

function FilterBuilderContent({
  className,
  showPreview,
  filterGroupProps,
  previewProps,
  emptyState,
}: FilterBuilderShellProps) {
  const { state, schema } = useFilterBuilder();

  const rootGroup = state.kind === 'group' ? state : schema.root;

  const {
    className: filterGroupClassName,
    childContainerClassName,
    ...restFilterGroupProps
  } = filterGroupProps ?? {};

  const groupProps: FilterGroupProps = {
    group: rootGroup,
    isRoot: true,
    className: joinClassNames('w-full', filterGroupClassName),
    childContainerClassName: joinClassNames(
      'space-y-4',
      childContainerClassName
    ),
    ...restFilterGroupProps,
  };

  const isEmpty = rootGroup.children.length === 0;

  const containerClass = joinClassNames(
    'flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8',
    className
  );

  const { className: previewClassName, ...restPreviewProps } =
    previewProps ?? {};

  const resolvedPreviewClass = joinClassNames(
    'w-full max-w-2xl lg:max-w-sm',
    previewClassName
  );

  return (
    <div className={containerClass}>
      <FilterGroup {...groupProps} />
      {isEmpty && emptyState}
      {showPreview ? (
        <QueryPreview className={resolvedPreviewClass} {...restPreviewProps} />
      ) : null}
    </div>
  );
}

export { FilterBuilderProvider } from './field-builder-provider/FilterBuilderProvider';
export { useFilterBuilder } from './field-builder-context/FilterBuilderContext';
export type { FilterBuilderProviderProps } from './field-builder-provider/FilterBuilderProvider';
export type { FilterBuilderContextValue } from './field-builder-context/FilterBuilderContext';

export default FilterBuilder;
