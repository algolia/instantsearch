import React, { PropTypes, Component, Children } from 'react';

/* eslint valid-jsdoc: 0 */
/**
 * @description
 * `<Index>` is the component that allows you to apply widgets to a dedicated index. It's
 * useful if you want to build an interface that targets multiple indices.
 * @kind widget
 * @name <Index>
 * @propType {string} indexName - index in which to search.
 * @example
 * import {InstantSearch, Index, SearchBox, Hits, Configure} from 'react-instantsearch/dom';
 *
 * export default function Search() {
 *   return (
 * <InstantSearch
          appId=""
          apiKey=""
          indexName="index1">
      <SearchBox/>
      <Configure hitsPerPage={1} />
      <Index indexName="index1">
        <Hits />
      </Index>
      <Index indexName="index2">
        <Hits />
      </Index>
  </InstantSearch>
 *   );
 * }
 */
class Index extends Component {
  getChildContext() {
    return {
      multiIndexContext: {
        targetedIndex: this.props.indexName,
      },
    };
  }

  render() {
    const childrenCount = Children.count(this.props.children);
    const { Root, props } = this.props.root;
    if (childrenCount === 0) return null;
    else return <Root {...props}>{this.props.children}</Root>;
  }
}

Index.propTypes = {
  // @TODO: These props are currently constant.
  indexName: PropTypes.string.isRequired,
  children: PropTypes.node,
  root: PropTypes.shape({
    Root: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.func,
    ]),
    props: PropTypes.object,
  }).isRequired,
};

Index.childContextTypes = {
  // @TODO: more precise widgets manager propType
  multiIndexContext: PropTypes.object.isRequired,
};

export default Index;
