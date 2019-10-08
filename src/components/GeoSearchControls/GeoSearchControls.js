/** @jsx h */

import { h } from 'preact';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Template from '../Template/Template';
import GeoSearchButton from './GeoSearchButton';
import GeoSearchToggle from './GeoSearchToggle';

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
}) =>
  enableRefine && (
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
          <Template {...templateProps} templateKey="reset" rootTagName="span" />
        </GeoSearchButton>
      )}
    </div>
  );

const CSSClassesPropTypes = PropTypes.shape({
  control: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  selectedLabel: PropTypes.string.isRequired,
  input: PropTypes.string.isRequired,
  redo: PropTypes.string.isRequired,
  disabledRedo: PropTypes.string.isRequired,
  reset: PropTypes.string.isRequired,
});

GeoSearchControls.propTypes = {
  cssClasses: CSSClassesPropTypes.isRequired,
  enableRefine: PropTypes.bool.isRequired,
  enableRefineControl: PropTypes.bool.isRequired,
  enableClearMapRefinement: PropTypes.bool.isRequired,
  isRefineOnMapMove: PropTypes.bool.isRequired,
  isRefinedWithMap: PropTypes.bool.isRequired,
  hasMapMoveSinceLastRefine: PropTypes.bool.isRequired,
  onRefineToggle: PropTypes.func.isRequired,
  onRefineClick: PropTypes.func.isRequired,
  onClearClick: PropTypes.func.isRequired,
  templateProps: PropTypes.object.isRequired,
};

export default GeoSearchControls;
