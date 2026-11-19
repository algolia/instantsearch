import type { TOC } from '@ember/component/template-only';

export interface HighlightedPart {
  isHighlighted: boolean;
  value: string;
}

export interface HighlightPartsSignature {
  Element: HTMLSpanElement;
  Args: {
    parts: HighlightedPart[][];
    separator?: string;
  };
}

function isLast(list: unknown[], index: number) {
  return index === list.length - 1;
}

/**
 * The markup of a highlighted value, with the `ais-Highlight` classes.
 *
 * `parts` has one entry per value, because an attribute can hold an array.
 */
const HighlightParts: TOC<HighlightPartsSignature> = <template>
  <span class="ais-Highlight" ...attributes>
    {{#each @parts as |part index|}}
      {{#each part as |subPart|}}
        {{#if subPart.isHighlighted}}
          <mark class="ais-Highlight-highlighted">{{subPart.value}}</mark>
        {{else}}
          <span class="ais-Highlight-nonHighlighted">{{subPart.value}}</span>
        {{/if}}
      {{/each}}
      {{#unless (isLast @parts index)}}
        <span class="ais-Highlight-separator">{{if
            @separator
            @separator
            ", "
          }}</span>
      {{/unless}}
    {{/each}}
  </span>
</template>;

export default HighlightParts;
