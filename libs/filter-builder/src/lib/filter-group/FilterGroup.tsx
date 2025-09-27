import type { ReactNode } from 'react';

import {
  GroupControls,
  type GroupControlsProps,
} from '../group-controls/GroupControls';
import {
  FilterCondition,
  type FilterConditionProps,
} from '../filter-condition/FilterCondition';
import type { ConditionNode, FilterNode, GroupNode } from '../../core/types';

const joinClassNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export interface FilterGroupProps {
  group: GroupNode;
  isRoot?: boolean;
  className?: string;
  childContainerClassName?: string;
  groupControlsProps?: Omit<GroupControlsProps, 'group'>;
  renderChild?: (child: FilterNode, index: number) => ReactNode;
  filterConditionProps?: Omit<FilterConditionProps, 'condition'>;
}

export function FilterGroup({
  group,
  isRoot,
  className,
  childContainerClassName,
  groupControlsProps,
  renderChild,
  filterConditionProps,
}: FilterGroupProps) {
  const disableRemove = Boolean(isRoot || groupControlsProps?.disableRemove);
  const controlsProps: GroupControlsProps = {
    ...(groupControlsProps ?? {}),
    group,
    disableRemove,
  };

  const baseGroupClass = isRoot
    ? 'space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
    : 'space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm';

  const baseChildrenClass = isRoot
    ? 'mt-3 space-y-3 border-l border-slate-100 pl-4 sm:pl-6'
    : 'mt-3 space-y-3 border-l border-slate-200/70 pl-3 sm:pl-5';

  const resolvedGroupClass = joinClassNames(baseGroupClass, className);
  const resolvedChildrenClass = joinClassNames(
    baseChildrenClass,
    childContainerClassName
  );

  const { className: conditionClassNameProp, ...restConditionProps } =
    filterConditionProps ?? {};

  const resolvedConditionClass = joinClassNames(
    'flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm sm:gap-4',
    conditionClassNameProp
  );

  const renderDefaultChild = (child: FilterNode, index: number) => {
    if (child.kind === 'condition') {
      return (
        <FilterCondition
          key={child.id}
          condition={child as ConditionNode}
          className={resolvedConditionClass}
          {...restConditionProps}
        />
      );
    }

    return (
      <FilterGroup
        key={child.id}
        group={child as GroupNode}
        className={className}
        childContainerClassName={childContainerClassName}
        groupControlsProps={groupControlsProps}
        filterConditionProps={filterConditionProps}
      />
    );
  };

  return (
    <div
      className={resolvedGroupClass}
      role={isRoot ? 'tree' : 'group'}
      aria-label={isRoot ? 'Filter group root' : 'Filter group'}
    >
      <GroupControls {...controlsProps} />
      <div className={resolvedChildrenClass}>
        {group.children.map((child, index) =>
          renderChild
            ? renderChild(child, index)
            : renderDefaultChild(child, index)
        )}
      </div>
    </div>
  );
}

export default FilterGroup;
