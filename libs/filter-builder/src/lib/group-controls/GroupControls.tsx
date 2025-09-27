import type { ButtonHTMLAttributes, ChangeEvent, ReactNode } from 'react';

import { useFilterBuilder } from '../field-builder-context/FilterBuilderContext';
import type { GroupNode } from '../../core/types';

type ButtonProps = Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'disabled'
>;

const joinClassNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export interface GroupControlsProps {
  group: GroupNode;
  disableRemove?: boolean;
  addConditionLabel?: string;
  addGroupLabel?: string;
  removeLabel?: string;
  combinatorLabel?: string;
  onAddCondition?: (groupId: string) => void;
  onAddGroup?: (groupId: string) => void;
  onRemoveGroup?: (groupId: string) => void;
  onCombinatorChange?: (
    groupId: string,
    combinator: GroupNode['combinator']
  ) => void;
  renderActions?: (actions: {
    addCondition: () => void;
    addGroup: () => void;
    removeGroup: () => void;
    setCombinator: (next: GroupNode['combinator']) => void;
  }) => ReactNode;
  addConditionButtonProps?: ButtonProps;
  addGroupButtonProps?: ButtonProps;
  removeButtonProps?: ButtonProps;
}

const defaultAddConditionLabel = 'Add condition';
const defaultAddGroupLabel = 'Add group';
const defaultRemoveLabel = 'Remove group';
const defaultCombinatorLabel = 'Group operator';

export function GroupControls({
  group,
  disableRemove,
  addConditionLabel = defaultAddConditionLabel,
  addGroupLabel = defaultAddGroupLabel,
  removeLabel = defaultRemoveLabel,
  combinatorLabel = defaultCombinatorLabel,
  onAddCondition,
  onAddGroup,
  onRemoveGroup,
  onCombinatorChange,
  renderActions,
  addConditionButtonProps,
  addGroupButtonProps,
  removeButtonProps,
}: GroupControlsProps) {
  const { dispatch } = useFilterBuilder();

  const addCondition = () => {
    dispatch({ type: 'ADD_CONDITION', groupId: group.id });
    onAddCondition?.(group.id);
  };

  const addGroup = () => {
    dispatch({ type: 'ADD_GROUP', groupId: group.id });
    onAddGroup?.(group.id);
  };

  const removeGroup = () => {
    if (disableRemove) return;
    dispatch({ type: 'REMOVE_NODE', nodeId: group.id });
    onRemoveGroup?.(group.id);
  };

  const setCombinator = (next: GroupNode['combinator']) => {
    if (group.combinator === next) return;
    dispatch({
      type: 'UPDATE_GROUP',
      groupId: group.id,
      combinator: next,
    });
    onCombinatorChange?.(group.id, next);
  };

  const handleCombinatorChange = ({
    currentTarget,
  }: ChangeEvent<HTMLSelectElement>) => {
    const next = currentTarget.value as GroupNode['combinator'];
    setCombinator(next);
  };

  if (renderActions) {
    return (
      <>
        {renderActions({ addCondition, addGroup, removeGroup, setCombinator })}
      </>
    );
  }

  const baseButtonClasses =
    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60';

  const addConditionClassName = joinClassNames(
    baseButtonClasses,
    'border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 focus:ring-indigo-500/60',
    addConditionButtonProps?.className
  );

  const addGroupClassName = joinClassNames(
    baseButtonClasses,
    'border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 focus:ring-emerald-500/60',
    addGroupButtonProps?.className
  );

  const removeClassName = joinClassNames(
    baseButtonClasses,
    'border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 focus:ring-rose-500/60',
    removeButtonProps?.className
  );

  return (
    <div
      role="toolbar"
      aria-label={`Controls for group ${group.id}`}
      className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white/90 p-3 shadow-sm sm:gap-3"
    >
      <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <span>{combinatorLabel}</span>
        <select
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
          aria-label={combinatorLabel}
          value={group.combinator}
          onChange={handleCombinatorChange}
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
      </label>
      <button
        type="button"
        onClick={addCondition}
        aria-label={addConditionLabel}
        className={addConditionClassName}
        disabled={addConditionButtonProps?.disabled}
      >
        + Condition
      </button>
      <button
        type="button"
        onClick={addGroup}
        aria-label={addGroupLabel}
        className={addGroupClassName}
        disabled={addGroupButtonProps?.disabled}
      >
        + Group
      </button>
      <button
        type="button"
        onClick={removeGroup}
        className={removeClassName}
        disabled={Boolean(disableRemove) || removeButtonProps?.disabled}
        aria-label={removeLabel}
      >
        Remove
      </button>
    </div>
  );
}

export default GroupControls;
