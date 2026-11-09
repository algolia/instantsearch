/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h, Fragment } from 'preact';

import Template from '../Template/Template';

import GeoSearchButton from './GeoSearchButton';
import GeoSearchToggle from './GeoSearchToggle';

import type { PreparedTemplateProps } from '../../lib/templating';
import type { ComponentCSSClasses } from '../../types';
import type {
  GeoSearchCSSClasses,
  GeoSearchTemplates,
} from '../../widgets/geo-search/geo-search';

type Props = {
  cssClasses: ComponentCSSClasses<GeoSearchCSSClasses>;
  enableRefine: boolean;
  enableRefineControl: boolean;
  enableClearMapRefinement: boolean;
  isRefineOnMapMove: boolean;
  isRefinedWithMap: boolean;
  hasMapMovedSinceLastRefine: boolean;
  onRefineToggle: (event: Event) => void;
  onRefineClick: (event: MouseEvent) => void;
  onClearClick: (event: MouseEvent) => void;
  templateProps: PreparedTemplateProps<GeoSearchTemplates>;
};

const GeoSearchControls = ({
  cssClasses,
  enableRefine,
  enableRefineControl,
  enableClearMapRefinement,
  isRefineOnMapMove,
  isRefinedWithMap,
  hasMapMovedSinceLastRefine,
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
            {isRefineOnMapMove || !hasMapMovedSinceLastRefine ? (
              <GeoSearchToggle
                classNameLabel={cx(
                  cssClasses.label,
                  isRefineOnMapMove && cssClasses.selectedLabel
                )}
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
                disabled={!hasMapMovedSinceLastRefine}
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
              className={cx(
                cssClasses.redo,
                !hasMapMovedSinceLastRefine && cssClasses.disabledRedo
              )}
              disabled={!hasMapMovedSinceLastRefine}
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
