import React from 'react';
import {
  InstantSearch,
  Reset,
  SearchBox,
  Pagination,
} from '../packages/react-instantsearch/dom';
import {connectHits} from '../packages/react-instantsearch/connectors';

const Wrap = props =>
  <InstantSearch
    className="container-fluid"
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="ikea"
    urlSync={false}
  >
    {props.children}
  </InstantSearch>;

Wrap.propTypes = {
  children: React.PropTypes.node,
};

const resetStyle = {
  root: {
    paddingLeft: 10,
    height: '100%',
    display: 'flex',
    border: 'none',
    backgroundColor: '#3e82f7',
    color: 'white',
    marginLeft: 5,
  },
};

const WrapWithHits = ({children, searchBox = true, linkedStoryGroup}) => {
  const playgroundUrl = process.env.NODE_ENV === 'development'
    ? `http://localhost:6006?selectedKind=${linkedStoryGroup}&selectedStory=playground`
    : `https://community.algolia.com/instantsearch.js/react/storybook/?selectedKind=${linkedStoryGroup}&selectedStory=playground`
  const playgroundLink = linkedStoryGroup
    ? <a target="_blank"
         href={playgroundUrl}>
    <div className="footer-container"></div>
  </a>
    : null;

  return <InstantSearch
    className="container-fluid"
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="ikea"
    urlSync={false}
  >
    <div>
      <div className="container widget-container">
        {children}
      </div>
      <div>
        <div style={linkedStoryGroup ? {} : {borderRadius: '0px 0px 5px 5px'}}
             className="container hits-container">
          <div className="hit-actions">
            {searchBox ?
              <SearchBox translations={{placeholder: 'Search into our furnitures: chair, table, tv unit...'}}/>
              : null}
            <div>
              <Reset
                theme={resetStyle}
                translations={{reset: 'Clear all filters'}}
              />
            </div>
          </div>
          <CustomHits hitsPerPage={3}/>
          <div className="hit-pagination"><Pagination showLast={true}/></div>
        </div>
        {playgroundLink}
      </div>
    </div>
  </InstantSearch>;
};

const CustomHits = connectHits(({hits}) =>
  <div className="hits">
    {hits.map((hit, idx) =>
      <div key={idx} className="hit">
        <div>
          <div className="hit-picture"><img src={`${hit.image}`}/></div>
        </div>
        <div className="hit-content">
          <div>
              <span className="hit-name"
                    dangerouslySetInnerHTML={{__html: hit._highlightResult.name.value}}></span>
            <span> - ${hit.price}</span>
            <span> - {hit.rating} stars</span>
          </div>
          <div className="hit-type" dangerouslySetInnerHTML={{__html: hit._highlightResult.type.value}}></div>
          <div className="hit-description"
               dangerouslySetInnerHTML={{__html: hit._highlightResult.description.value}}></div>
        </div>
      </div>
    )}
  </div>
);

WrapWithHits.propTypes = {
  children: React.PropTypes.node,
  searchBox: React.PropTypes.boolean,
  linkedStoryGroup: React.PropTypes.string,
};

export {
  Wrap,
  WrapWithHits,
};
