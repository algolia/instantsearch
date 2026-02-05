/** @jsx createElement */

import { cx } from '../../lib';

import { SubmitIcon, ApplyIcon } from './icons';

import type { ComponentChildren, Renderer } from '../../types';

export type AutocompleteSuggestionProps<
  T = { query: string } & Record<string, unknown>
> = {
  item: T;
  onSelect: () => void;
  onApply: () => void;
  children: ComponentChildren;
  classNames?: Partial<AutocompleteSuggestionClassNames>;
};

export type AutocompleteSuggestionClassNames = {
  /**
   * Class names to apply to the root element
   **/
  root: string | string[];
  /** Class names to apply to the content element **/
  content: string | string[];
  /** Class names to apply to the actions element **/
  actions: string | string[];
  /** Class names to apply to the icon element **/
  icon: string | string[];
  /** Class names to apply to the body element **/
  body: string | string[];
  /** Class names to apply to the apply button element **/
  applyButton: string | string[];
};

export function createAutocompleteSuggestionComponent({
  createElement,
}: Renderer) {
  return function AutocompleteSuggestion(
    userProps: AutocompleteSuggestionProps
  ) {
    const { item, children, onSelect, onApply, classNames = {} } = userProps;
    return (
      <div
        onClick={onSelect}
        className={cx(
          'ais-AutocompleteItemWrapper',
          'ais-AutocompleteSuggestionWrapper',
          classNames.root
        )}
      >
        <div
          className={cx(
            'ais-AutocompleteItemContent',
            'ais-AutocompleteSuggestionItemContent',
            classNames.content
          )}
        >
          <div
            className={cx(
              'ais-AutocompleteItemIcon',
              'ais-AutocompleteSuggestionItemIcon',
              classNames.content
            )}
          >
            <SubmitIcon createElement={createElement} />
          </div>
          <div
            className={cx(
              'ais-AutocompleteItemContentBody',
              'ais-AutocompleteSuggestionItemContentBody',
              classNames.content
            )}
          >
            {children}
          </div>
        </div>
        <div
          className={cx(
            'ais-AutocompleteItemActions',
            'ais-AutocompleteSuggestionItemActions',
            classNames.actions
          )}
        >
          <button
            className={cx(
              'ais-AutocompleteItemActionButton',
              'ais-AutocompleteSuggestionItemApplyButton',
              classNames.applyButton
            )}
            type="button"
            title={`Apply ${item.query} as search`}
            onClick={(evt) => {
              evt.stopPropagation();
              onApply();
            }}
          >
            <ApplyIcon createElement={createElement} />
          </button>
        </div>
      </div>
    );
  };
}
