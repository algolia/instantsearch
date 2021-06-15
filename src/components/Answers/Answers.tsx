/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';
import Template from '../Template/Template';
import {
  AnswersCSSClasses,
  AnswersTemplates,
} from '../../widgets/answers/answers';
import { ComponentCSSClasses, Hits } from '../../types';

export type AnswerComponentCSSClasses = ComponentCSSClasses<AnswersCSSClasses>;

export type AnswersProps = {
  hits: Hits;
  isLoading: boolean;
  cssClasses: AnswerComponentCSSClasses;
  templateProps: {
    [key: string]: any;
    templates: AnswersTemplates;
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
