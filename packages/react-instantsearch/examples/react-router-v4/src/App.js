import React, {Component} from 'react';
import {
  InstantSearch, HierarchicalMenu,
  Hits, Menu, Pagination, PoweredBy, StarRating,
  RefinementList, SearchBox, ClearAll,
} from 'react-instantsearch/dom';
import 'react-instantsearch-theme-algolia/style.css';
import qs from 'qs';

export default class App extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  onSearchStateChange (nextSearchState) {
    const THRESHOLD = 700
    const newPush = Date.now()
    let { router } = this.context
    this.setState({ lastPush: newPush })

    if (this.state.lastPush && newPush - this.state.lastPush <= THRESHOLD) {
      router.replaceWith(nextSearchState ? `?${qs.stringify(nextSearchState)}` : '')
    } else {
      router.transitionTo(nextSearchState ? `?${qs.stringify(nextSearchState)}` : '')
    }
  }

  render() {
    let { location } = this.props
    return (
      <InstantSearch
        appId="latency"
        apiKey="6be0576ff61c053d5f9a3225e2a90f76"
        indexName="ikea"
        searchState={qs.parse(location.query)}
        onSearchStateChange={this.onSearchStateChange.bind(this)}
        createURL={state => `?${qs.stringify(state)}`}
      >

        <div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
          }}>
            <SearchBox/>
            <PoweredBy />
          </div>
          <div style={{display: 'flex'}}>
            <div style={{padding: '0px 20px'}}>
              <p>Hierarchical Menu</p>
              <HierarchicalMenu
                id="categories"
                attributes={[
                  'category',
                  'sub_category',
                  'sub_sub_category',
                ]}
              />
              <p>Menu</p>
              <Menu attributeName="type"/>
              <p>Refinement List</p>
              <RefinementList attributeName="colors"/>
              <p>Range Ratings</p>
              <StarRating attributeName="rating" max={6}/>

            </div>
            <div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
              <div style={{display: 'flex', justifyContent: 'space-around'}}>
                <ClearAll/>
              </div>
              <div>
                <Hits />
              </div>
              <div style={{alignSelf: 'center'}}>
                <Pagination showLast={true}/>
              </div>
            </div>
          </div>
        </div>
      </InstantSearch>
    );
  }
}

App.contextTypes = {
  router: React.PropTypes.object
}
