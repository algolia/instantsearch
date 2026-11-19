import type Connector from '../components/connector.gts';
import type Index from '../components/index-widget.gts';
import type Widget from '../components/widget.gts';
import type { Parent } from '../types.ts';
import type { WithBoundArgs } from '@glint/template';

/**
 * What `<InstantSearch>` and `<Index>` yield:
 * their `Parent`, and the widgets bound to it.
 */
export interface Yielded extends Parent {
  Connector: WithBoundArgs<typeof Connector, 'parent'>;
  Index: WithBoundArgs<typeof Index, 'parent'>;
  Widget: WithBoundArgs<typeof Widget, 'parent'>;
}
