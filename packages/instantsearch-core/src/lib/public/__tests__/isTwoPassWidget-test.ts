import { isTwoPassWidget } from '../isTwoPassWidget';

describe('isTwoPassWidget', () => {
  it('returns true for dynamic widgets', () => {
    expect(isTwoPassWidget({ $$type: 'ais.dynamicWidgets' } as any)).toBe(true);
  });

  it('returns true for feeds', () => {
    expect(isTwoPassWidget({ $$type: 'ais.feeds' } as any)).toBe(true);
  });

  it('returns false for other widget types', () => {
    expect(isTwoPassWidget({ $$type: 'ais.searchBox' } as any)).toBe(false);
    expect(isTwoPassWidget({ $$type: 'ais.index' } as any)).toBe(false);
  });
});
