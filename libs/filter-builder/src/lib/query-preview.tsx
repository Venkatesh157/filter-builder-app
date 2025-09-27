import { useMemo } from 'react';

import { useFilterBuilder } from './field-builder-context/FilterBuilderContext';
import { toJSON, toQueryString } from '../core/serialization';

const joinClassNames = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export interface QueryPreviewProps {
  className?: string;
  jsonLabel?: string;
  queryLabel?: string;
  issuesLabel?: string;
}

const defaultJsonLabel = 'JSON';
const defaultQueryLabel = 'Query String';
const defaultIssuesLabel = 'Validation Issues';

export function QueryPreview({
  className,
  jsonLabel = defaultJsonLabel,
  queryLabel = defaultQueryLabel,
  issuesLabel = defaultIssuesLabel,
}: QueryPreviewProps) {
  const { state, issues } = useFilterBuilder();

  const serialized = useMemo(() => toJSON(state), [state]);
  const queryString = useMemo(() => toQueryString(state), [state]);

  const sectionClass = joinClassNames(
    'space-y-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm',
    className
  );

  return (
    <section className={sectionClass} aria-label="Filter preview">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {jsonLabel}
        </h2>
      </header>
      <pre className="overflow-auto rounded-md bg-slate-900/95 p-3 text-xs text-slate-100 shadow-inner">
        {JSON.stringify(serialized, null, 2)}
      </pre>

      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {queryLabel}
        </h2>
      </header>
      <code className="block overflow-auto rounded-md bg-slate-900/90 p-3 text-xs text-emerald-200 shadow-inner">
        {queryString}
      </code>

      {issues.length > 0 && (
        <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/80 p-3">
          <h2 className="text-sm font-semibold text-amber-700">
            {issuesLabel}
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-amber-700">
            {issues.map((issue, index) => (
              <li
                key={`${issue.path.join('.')}-${index}`}
                role={issue.severity === 'error' ? 'alert' : 'status'}
              >
                {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default QueryPreview;
