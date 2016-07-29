import createHierarchicalMenu from '../hoc/createHierarchicalMenu';
import createShowMore from '../hoc/createShowMore';
import HM from '../impl/HierarchicalMenu';
import {applyDefaultProps} from '../utils';
export default createShowMore(props => ({
  // Start with the menu collapsed.
  initialLimit: props.limitMin || HM.defaultProps.limitMin,
}))(createHierarchicalMenu(props => {
  const defaultedProps = applyDefaultProps(props, HM.defaultProps);
  return {
    name: props.name,
    attributes: props.attributes,
    separator: props.separator,
    rootPath: props.rootPath,
    showParentLevel: props.showParentLevel,
    sortBy: props.sortBy,
    // Always load `limitMax` facet values. This prevents UI incoherences where
    // loading more facet values changes the display of seemingly unrelated
    // components.
    limit: defaultedProps.showMore ?
      defaultedProps.limitMax :
      defaultedProps.limitMin,
  };
})(HM));
