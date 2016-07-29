import createRefinementList from '../hoc/createRefinementList';
import createShowMore from '../hoc/createShowMore';
import RefinementList from '../impl/RefinementList';
import {applyDefaultProps} from '../utils';
export default createShowMore(props => ({
  // Start with the refinement list collapsed.
  initialLimit: props.limitMin || RefinementList.defaultProps.limitMin,
}))(createRefinementList(props => {
  const defaultedProps = applyDefaultProps(props, RefinementList.defaultProps);
  return {
    attributeName: props.attributeName,
    operator: props.operator,
    // Always load `limitMax` facet values. This prevents UI incoherences where
    // loading more facet values changes the display of seemingly unrelated
    // components.
    limit: defaultedProps.showMore ?
      defaultedProps.limitMax :
      defaultedProps.limitMin,
    sortBy: props.sortBy,
  };
})(RefinementList));
