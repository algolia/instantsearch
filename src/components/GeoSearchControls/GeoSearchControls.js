import React from 'preact-compat';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Template from '../Template';
import GeoSearchButton from './GeoSearchButton';
import GeoSearchToggle from './GeoSearchToggle';

const GeoSearchControls = ({
  cssClasses,
  enableRefineControl,
  enableClearMapRefinement,
  isRefineOnMapMove,
  isRefinedWithMap,
  hasMapMoveSinceLastRefine,
  onRefineToggle,
  onRefineClick,
  onClearClick,
  templateProps,
}) => (
  <div>
    {enableRefineControl && (
      <div className={cssClasses.control}>
        {isRefineOnMapMove || !hasMapMoveSinceLastRefine ? (
          <GeoSearchToggle
            classNameLabel={cx(
              cssClasses.toggleLabel,
              isRefineOnMapMove && cssClasses.toggleLabelActive
            )}
            classNameInput={cssClasses.toggleInput}
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

    {!enableRefineControl &&
      !isRefineOnMapMove && (
        <div className={cssClasses.control}>
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
        </div>
      )}

    {enableClearMapRefinement &&
      isRefinedWithMap && (
        <GeoSearchButton className={cssClasses.clear} onClick={onClearClick}>
          <Template {...templateProps} templateKey="clear" rootTagName="span" />
        </GeoSearchButton>
      )}
  </div>
);

const CSSClassesPropTypes = PropTypes.shape({
  control: PropTypes.string.isRequired,
  toggleLabel: PropTypes.string.isRequired,
  toggleLabelActive: PropTypes.string.isRequired,
  toggleInput: PropTypes.string.isRequired,
  redo: PropTypes.string.isRequired,
  clear: PropTypes.string.isRequired,
});

GeoSearchControls.propTypes = {
  cssClasses: CSSClassesPropTypes.isRequired,
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
