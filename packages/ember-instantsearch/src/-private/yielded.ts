import type Configure from '../components/configure.gts';
import type Connector from '../components/connector.gts';
import type Hits from '../components/hits.gts';
import type Index from '../components/index-widget.gts';
import type Widget from '../components/widget.gts';
import type { Parent } from '../types.ts';
import type { WithBoundArgs } from '@glint/template';

/**
 * What `<InstantSearch>` and `<Index>` yield:
 * their `Parent`, and the widgets bound to it.
 */
export interface Yielded extends Parent {
  Configure: WithBoundArgs<typeof Configure, 'parent'>;
  Connector: WithBoundArgs<typeof Connector, 'parent'>;
  Hits: WithBoundArgs<typeof Hits, 'parent'>;
  Index: WithBoundArgs<typeof Index, 'parent'>;
  Widget: WithBoundArgs<typeof Widget, 'parent'>;
}
