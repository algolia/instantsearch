/** @jsx h */

import { h, Fragment } from 'preact';
import cx from 'classnames';
import Template from '../Template/Template';
import GeoSearchButton from './GeoSearchButton';
import GeoSearchToggle from './GeoSearchToggle';
import {
  GeoSearchCSSClasses,
  GeoSearchTemplates,
} from '../../widgets/geo-search/geo-search';
import { ComponentCSSClasses } from '../../types';
import { PreparedTemplateProps } from '../../lib/utils/prepareTemplateProps';

type Props = {
  cssClasses: ComponentCSSClasses<GeoSearchCSSClasses>;
  enableRefine: boolean;
  enableRefineControl: boolean;
  enableClearMapRefinement: boolean;
  isRefineOnMapMove: boolean;
  isRefinedWithMap: boolean;
  hasMapMoveSinceLastRefine: boolean;
  onRefineToggle(event: Event): void;
  onRefineClick(event: MouseEvent): void;
  onClearClick(event: MouseEvent): void;
  templateProps: PreparedTemplateProps<GeoSearchTemplates>;
};

const GeoSearchControls = ({
  cssClasses,
  enableRefine,
  enableRefineControl,
  enableClearMapRefinement,
  isRefineOnMapMove,
  isRefinedWithMap,
  hasMapMoveSinceLastRefine,
  onRefineToggle,
  onRefineClick,
  onClearClick,
  templateProps,
}: Props) => (
  <Fragment>
    {enableRefine && (
      <div>
        {enableRefineControl && (
          <div className={cssClasses.control}>
            {isRefineOnMapMove || !hasMapMoveSinceLastRefine ? (
              <GeoSearchToggle
                classNameLabel={cx(cssClasses.label, {
                  [cssClasses.selectedLabel]: isRefineOnMapMove,
                })}
                classNameInput={cssClasses.input}
                checked={isRefineOnMapMove}
                onToggle={onRefineToggle}
              >
                <Template
                  {...templateProps}
                  templateKey="toggle"
                  rootTagName="span"
                />
              </GeoSearchToggle>
            ) : (
              <GeoSearchButton
                className={cssClasses.redo}
                disabled={!hasMapMoveSinceLastRefine}
                onClick={onRefineClick}
              >
                <Template
                  {...templateProps}
                  templateKey="redo"
                  rootTagName="span"
                />
              </GeoSearchButton>
            )}
          </div>
        )}

        {!enableRefineControl && !isRefineOnMapMove && (
          <div className={cssClasses.control}>
            <GeoSearchButton
              className={cx(cssClasses.redo, {
                [cssClasses.disabledRedo]: !hasMapMoveSinceLastRefine,
              })}
              disabled={!hasMapMoveSinceLastRefine}
              onClick={onRefineClick}
            >
              <Template
                {...templateProps}
                templateKey="redo"
                rootTagName="span"
              />
            </GeoSearchButton>
          </div>
        )}

        {enableClearMapRefinement && isRefinedWithMap && (
          <GeoSearchButton className={cssClasses.reset} onClick={onClearClick}>
            <Template
              {...templateProps}
              templateKey="reset"
              rootTagName="span"
            />
          </GeoSearchButton>
        )}
      </div>
    )}
  </Fragment>
);

export default GeoSearchControls;
