import createMenu from '../hoc/createMenu';
import createShowMore from '../hoc/createShowMore';
import Menu from '../impl/Menu';
import {applyDefaultProps} from '../utils';
export default createShowMore(props => ({
  // Start with the menu collapsed.
  initialLimit: props.limitMin || Menu.defaultProps.limitMin,
}))(createMenu(props => {
  const defaultedProps = applyDefaultProps(props, Menu.defaultProps);
  return {
    attributeName: props.attributeName,
    // Always load `limitMax` facet values. This prevents UI incoherences where
    // loading more facet values changes the display of seemingly unrelated
    // components.
    limit: defaultedProps.showMore ?
      defaultedProps.limitMax :
      defaultedProps.limitMin,
    sortBy: props.sortBy,
  };
})(Menu));
