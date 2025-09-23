import { render } from '@testing-library/react';

import JsonFilterBuilderFilterBuilder from './filter-builder';

describe('JsonFilterBuilderFilterBuilder', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<JsonFilterBuilderFilterBuilder />);
    expect(baseElement).toBeTruthy();
  });
});
