import connectHierarchicalMenu from '../connectors/connectHierarchicalMenu';
import HierarchicalMenu from '../impl/HierarchicalMenu';

export default connectHierarchicalMenu({
  defaultProps: {
    showMore: false,
    limitMin: 10,
    limitMax: 20,
  },
  mapPropsToConfig: props => ({
    name: props.name,
    attributes: props.attributes,
    separator: props.separator,
    rootPath: props.rootPath,
    showParentLevel: props.showParentLevel,
    sortBy: props.sortBy,
    // Always load `limitMax` facet values. This prevents UI incoherences where
    // loading more facet values changes the display of seemingly unrelated
    // components.
    limit: props.showMore ? props.limitMax : props.limitMin,
  }),
})(HierarchicalMenu);
