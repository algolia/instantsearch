import React from 'react';
import {InstantSearch, Hits, CurrentFilters, SearchBox, Pagination} from '../packages/react-instantsearch';
import style from './util.css';

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

const currentFiltersStyle = {
  filters: {
    display: 'none',
  },
  root: {
    paddingLeft: 10,
    height: '100%',
    display: 'flex',
  },
  clearAll: {
    border: 'none',
    backgroundColor: '#3e82f7',
    color: 'white',
  },
};

const WrapWithHits = ({children, searchBox = true}) =>
  <InstantSearch
    className="container-fluid"
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="ikea"
    urlSync={false}
  >
    <div>
      <div className={`${style.widgetContainer} ${style.container}`}>
        {children}
      </div>
      <div className={`${style.hitsContainer} ${style.container}`}>
        <div className={style.hitActions}>
          {searchBox ? <SearchBox translations={{placeholder: 'Search into our furnitures: chair, table, tv unit...'}}/>
            : null}
          <div className={style.currentFilters}>
            <CurrentFilters
              theme={currentFiltersStyle}
              translations={{clearAll: 'Clear all filters'}}
            />
          </div>
        </div>
        <CustomHits hitsPerPage={3}/>
        <div className={style.hitPagination}><Pagination showLast={true}/></div>
      </div>
    </div>
  </InstantSearch>;

const CustomHits = Hits.connect(({hits}) =>
  <div className={style.hits}>
    {hits.map((hit, idx) =>
      <div key={idx} className={style.hit}>
        <div>
          <div className={style.hitPicture}><img src={`${hit.image}`}/></div>
        </div>
        <div className={style.hitContent}>
          <div>
              <span className={style.hitName}
                    dangerouslySetInnerHTML={{__html: hit._highlightResult.name.value}}></span>
            <span> - ${hit.price}</span>
            <span> - {hit.rating} stars</span>
          </div>
          <div className={style.hitType} dangerouslySetInnerHTML={{__html: hit._highlightResult.type.value}}></div>
          <div className={style.hitDescription}
               dangerouslySetInnerHTML={{__html: hit._highlightResult.description.value}}></div>
        </div>
      </div>
    )}
  </div>
);

WrapWithHits.propTypes = {
  children: React.PropTypes.node,
  searchBox: React.PropTypes.boolean,
};

export {
  Wrap,
  WrapWithHits,
};
