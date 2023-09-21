/** @jsx h */

import { cx } from '@algolia/ui-components-shared';
import { h } from 'preact';

import { warning } from '../../lib/utils';
import Template from '../Template/Template';

import type { ComponentCSSClasses, Hit } from '../../types';
import type {
  AnswersCSSClasses,
  AnswersTemplates,
} from '../../widgets/answers/answers';

export type AnswersComponentCSSClasses = ComponentCSSClasses<AnswersCSSClasses>;

export type AnswersComponentTemplates = Required<AnswersTemplates>;

export type AnswersProps = {
  hits: Hit[];
  isLoading: boolean;
  cssClasses: AnswersComponentCSSClasses;
  templateProps: {
    [key: string]: any;
    templates: AnswersComponentTemplates;
  };
};

const Answers = ({
  hits,
  isLoading,
  cssClasses,
  templateProps,
}: AnswersProps) => (
  <div
    className={cx(cssClasses.root, hits.length === 0 && cssClasses.emptyRoot)}
  >
    <Template
      {...templateProps}
      templateKey="header"
      rootProps={{ className: cssClasses.header }}
      data={{
        hits,
        isLoading,
      }}
    />
    {isLoading ? (
      <Template
        {...templateProps}
        templateKey="loader"
        rootProps={{ className: cssClasses.loader }}
      />
    ) : (
      <ul className={cssClasses.list}>
        {hits.map((hit, index) => (
          <Template
            {...templateProps}
            templateKey="item"
            rootTagName="li"
            rootProps={{ className: cssClasses.item }}
            key={hit.objectID}
            data={{
              ...hit,
              get __hitIndex() {
                warning(
                  false,
                  'The `__hitIndex` property is deprecated. Use the absolute `__position` instead.'
                );
                return index;
              },
            }}
          />
        ))}
      </ul>
    )}
  </div>
);

export default Answers;
