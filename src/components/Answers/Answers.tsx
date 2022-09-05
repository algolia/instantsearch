/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';
import Template from '../Template/Template';
import type {
  AnswersCSSClasses,
  AnswersTemplates,
} from '../../widgets/answers/answers';
import type { ComponentCSSClasses, Hit } from '../../types';

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
    className={cx(cssClasses.root, {
      [cssClasses.emptyRoot]: hits.length === 0,
    })}
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
        {hits.map((hit, position) => (
          <Template
            {...templateProps}
            templateKey="item"
            rootTagName="li"
            rootProps={{ className: cssClasses.item }}
            key={hit.objectID}
            data={{
              ...hit,
              __hitIndex: position,
            }}
          />
        ))}
      </ul>
    )}
  </div>
);

export default Answers;
