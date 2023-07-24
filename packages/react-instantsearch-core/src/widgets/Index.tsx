import PropTypes from 'prop-types';
import React, { Component, Children } from 'react';

import { InstantSearchConsumer, IndexProvider } from '../core/context';

import type { InstantSearchContext, IndexContext } from '../core/context';
import type { SearchParameters } from 'algoliasearch-helper';

function getIndexContext(props: Props): IndexContext {
  return {
    targetedIndex: props.indexId,
  };
}

type Props = {
  indexName: string;
  indexId: string;
  children?: React.ReactNode;
};

type InnerProps = Props & { contextValue: InstantSearchContext };

type State = {
  indexContext: IndexContext;
};

/**
 * The component that allows you to apply widgets to a dedicated index. It's
 * useful if you want to build an interface that targets multiple indices.
 *
 * @example
 * import React from 'react';
 * import algoliasearch from 'algoliasearch/lite';
 * import { InstantSearch, Index, SearchBox, Hits, Configure } from 'react-instantsearch-dom';
 *
 * const searchClient = algoliasearch(
 *   'latency',
 *   '6be0576ff61c053d5f9a3225e2a90f76'
 * );
 *
 * const App = () => (
 *   <InstantSearch
 *     searchClient={searchClient}
 *     indexName="instant_search"
 *   >
 *     <Configure hitsPerPage={5} />
 *     <SearchBox />
 *     <Index indexName="instant_search">
 *       <Hits />
 *     </Index>
 *     <Index indexName="bestbuy">
 *       <Hits />
 *     </Index>
 *   </InstantSearch>
 * );
 */
class Index extends Component<InnerProps, State> {
  static propTypes = {
    indexName: PropTypes.string.isRequired,
    indexId: PropTypes.string.isRequired,
    children: PropTypes.node,
  };

  static displayName = 'AlgoliaIndex';
  static $$type = 'ais.index';
  static $$widgetType = 'ais.index';

  static getDerivedStateFromProps(props: InnerProps) {
    return {
      indexContext: getIndexContext(props),
    };
  }

  state = {
    indexContext: getIndexContext(this.props),
  };

  unregisterWidget?: () => void;

  constructor(props: InnerProps) {
    super(props);

    this.props.contextValue.onSearchParameters(
      this.getSearchParameters.bind(this),
      {
        ais: this.props.contextValue,
        multiIndexContext: this.state.indexContext,
      },
      this.props,
      undefined,
      Index.displayName
    );
  }

  componentDidMount() {
    this.unregisterWidget =
      this.props.contextValue.widgetsManager.registerWidget(this);
  }

  componentDidUpdate(prevProps: InnerProps) {
    if (this.props.indexName !== prevProps.indexName) {
      this.props.contextValue.widgetsManager.update();
    }
  }

  componentWillUnmount() {
    if (typeof this.unregisterWidget === 'function') {
      this.unregisterWidget();
    }
  }

  getSearchParameters(searchParameters: SearchParameters, props: InnerProps) {
    return searchParameters.setIndex(
      this.props ? this.props.indexName : props.indexName
    );
  }

  render() {
    const childrenCount = Children.count(this.props.children);
    if (childrenCount === 0) {
      return null;
    }
    return (
      <IndexProvider value={this.state.indexContext}>
        {this.props.children}
      </IndexProvider>
    );
  }
}

type IndexWrapperProps = {
  indexName: string;
  indexId?: string;
};

const IndexWrapper: React.FC<IndexWrapperProps> = (props) => {
  const inferredIndexId = props.indexName;
  return (
    <InstantSearchConsumer>
      {(contextValue) => (
        <Index
          contextValue={contextValue}
          indexId={inferredIndexId}
          {...props}
        />
      )}
    </InstantSearchConsumer>
  );
};

IndexWrapper.propTypes = {
  indexName: PropTypes.string.isRequired,
  indexId: PropTypes.string,
};

export const IndexComponentWithoutContext = Index;
export default IndexWrapper;
