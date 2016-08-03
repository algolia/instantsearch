import connectMenu from '../connectors/connectMenu';
import Menu from '../impl/Menu';

export default connectMenu({
  defaultProps: {
    showMore: false,
    limitMin: 10,
    limitMax: 20,
  },
  mapPropsToConfig: props => ({
    attributeName: props.attributeName,
    // Always load `limitMax` facet values. This prevents UI incoherences where
    // loading more facet values changes the display of seemingly unrelated
    // components.
    limit: props.showMore ? props.limitMax : props.limitMin,
    sortBy: props.sortBy,
  }),
})(Menu);
