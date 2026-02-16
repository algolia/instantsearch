/** @jsx createElement */

import { cx } from '../../lib';
import { SparklesIcon } from '../chat/icons';

import type { ComponentChildren, Renderer } from '../../types';

export type AutocompletePromptSuggestionProps<
  T = { query: string; label?: string } & Record<string, unknown>
> = {
  item: T;
  onSelect: () => void;
  children?: ComponentChildren;
  classNames?: Partial<AutocompletePromptSuggestionClassNames>;
};

export type AutocompletePromptSuggestionClassNames = {
  /**
   * Class names to apply to the root element.
   */
  root: string | string[];
  /**
   * Class names to apply to the content element.
   */
  content: string | string[];
  /**
   * Class names to apply to the icon element.
   */
  icon: string | string[];
  /**
   * Class names to apply to the body element.
   */
  body: string | string[];
};

export function createAutocompletePromptSuggestionComponent({
  createElement,
}: Renderer) {
  return function AutocompletePromptSuggestion(
    userProps: AutocompletePromptSuggestionProps
  ) {
    const { item, onSelect, children, classNames = {} } = userProps;
    const label = item.label || item.query;

    return (
      <div
        onClick={onSelect}
        className={cx(
          'ais-AutocompleteItemWrapper',
          'ais-AutocompletePromptSuggestionWrapper',
          classNames.root
        )}
      >
        <div
          className={cx(
            'ais-AutocompleteItemContent',
            'ais-AutocompletePromptSuggestionItemContent',
            classNames.content
          )}
        >
          <div
            className={cx(
              'ais-AutocompleteItemIcon',
              'ais-AutocompletePromptSuggestionItemIcon',
              classNames.icon
            )}
          >
            <SparklesIcon createElement={createElement} />
          </div>
          <div
            className={cx(
              'ais-AutocompleteItemContentBody',
              'ais-AutocompletePromptSuggestionItemContentBody',
              classNames.body
            )}
          >
            {children ?? label}
          </div>
        </div>
      </div>
    );
  };
}
