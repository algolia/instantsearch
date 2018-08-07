import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';

/* eslint valid-jsdoc: 0 */
/**
 * @description
 * `<Index>` is the component that allows you to apply widgets to a dedicated index. It's
 * useful if you want to build an interface that targets multiple indices.
 * @kind widget
 * @name <Index>
 * @propType {string} indexName - index in which to search.
 * @propType {{ Root: string|function, props: object }} [root] - Use this to customize the root element. Default value: `{ Root: 'div' }`
 * @example
 * import React from 'react';
 * import { InstantSearch, Index, SearchBox, Hits, Configure } from 'react-instantsearch-dom';
 *
 * const App = () => (
 *   <InstantSearch
 *     appId="latency"
 *     apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *     indexName="ikea"
 *   >
 *     <Configure hitsPerPage={5} />
 *     <SearchBox />
 *     <Index indexName="ikea">
 *       <Hits />
 *     </Index>
 *     <Index indexName="bestbuy">
 *       <Hits />
 *     </Index>
 *   </InstantSearch>
 * );
 */
class Index extends Component {
  constructor(props, context) {
    super(props);
    const {
      ais: { widgetsManager },
    } = context;

    /*
     we want <Index> to be seen as a regular widget.
     It means that with only <Index> present a new query will be sent to Algolia.
     That way you don't need a virtual hits widget to use the connectAutoComplete.
    */
    this.unregisterWidget = widgetsManager.registerWidget(this);
  }

  componentWillMount() {
    this.context.ais.onSearchParameters(
      this.getSearchParameters,
      this.getChildContext(),
      this.props
    );
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.indexName !== nextProps.indexName) {
      this.context.ais.widgetsManager.update();
    }
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
    return searchParameters.setIndex(
      this.props ? this.props.indexName : props.indexName
    );
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
    Root: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
      PropTypes.object,
    ]),
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
