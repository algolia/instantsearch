import {PropTypes} from 'react';

import createHOC from '../createHOC';

export default createHOC({
  displayName: 'AlgoliaHitsPerPage',

  propTypes: {
    defaultValue: PropTypes.number,
  },

  configure(state, props) {
    if (typeof state.hitsPerPage !== 'undefined') {
      return state;
    }
    return state.setQueryParameter('hitsPerPage', props.defaultValue);
  },

  mapStateToProps(state) {
    return {
      hitsPerPage: state.searchParameters.hitsPerPage,
    };
  },

  refine(state, props, hitsPerPage) {
    return state.setQueryParameter('hitsPerPage', hitsPerPage);
  },
});

//
// export default function createHitsPerPage(Composed) {
//   class HitsPerPageWrapper extends Component {
//     static propTypes = {
//       helper: PropTypes.object.isRequired,
//       // items: itemPropTypes,
//     };
//
//     refine = hitsPerPage => {
//       this.props.helper.setQueryParameter('hitsPerPage', hitsPerPage).search();
//     };
//
//     render() {
//       return (
//         <Composed
//           refine={this.refine}
//           // items={this.props.items.map(item => ({
//           //   ...item,
//           //   isRefined: item.value === this.props.hitsPerPage,
//           // }))}
//           // {...omit(this.props, 'hitsPerPage')}
//           {...this.props}
//         />
//       );
//     }
//   }
//
//   return connect(state => ({
//     hitsPerPage: state.searchParameters.hitsPerPage,
//   }))(HitsPerPageWrapper);
// }
