import PropTypes from 'prop-types';
import React, { Component, Children } from 'react';

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
  constructor(props, context) {
    super(props);
    const { ais: { widgetsManager } } = context;

    /*
     we want <Index> to be seen as a regular widget. 
     It means that with only <Index> present a new query will be sent to Algolia.
     That way you don't need a virtual hits widget to use the connectAutoComplete. 
    */
    this.unregisterWidget = widgetsManager.registerWidget({
      getSearchParameters: searchParameters =>
        this.getSearchParameters(searchParameters, this.props),
      multiIndexContext: {
        targetedIndex: this.props.indexName,
      },
    });
  }

  componentWillMount() {
    this.context.ais.onSearchParameters(
      this.getSearchParameters,
      this.getChildContext(),
      this.props
    );
  }

  componentWillUnmount() {
    this.unregisterWidget();
  }

  getChildContext() {
    return {
      multiIndexContext: {
        targetedIndex: this.props.indexName,
      },
    };
  }

  getSearchParameters(searchParameters, props) {
    return searchParameters.setIndex(props.indexName);
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
    Root: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    props: PropTypes.object,
  }).isRequired,
};

Index.childContextTypes = {
  multiIndexContext: PropTypes.object.isRequired,
};

Index.contextTypes = {
  // @TODO: more precise widgets manager propType
  ais: PropTypes.object.isRequired,
};

export default Index;
