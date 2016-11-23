import React, {Component} from 'react';
import {
  InstantSearch, HierarchicalMenu,
  Hits, Menu, Pagination, PoweredBy, RangeRatings,
  RefinementList, SearchBox, ClearAll,
} from 'react-instantsearch/dom';
/* eslint-disable import/no-unresolved */
import {withRouter} from 'react-router';
/* eslint-enable import/no-unresolved */
import qs from 'qs';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {state: {...qs.parse(this.props.router.location.query)}};
  }

  componentWillReceiveProps() {
    this.setState({state: qs.parse(this.props.router.location.query)});
  }

  onStateChange = nextState => {
    const THRESHOLD = 700;
    const newPush = Date.now();
    this.setState({lastPush: newPush, state: nextState});
    if (this.state.lastPush && newPush - this.state.lastPush <= THRESHOLD) {
      this.props.router.replace(nextState ? `?${qs.stringify(nextState)}` : '');
    } else {
      this.props.router.push(nextState ? `?${qs.stringify(nextState)}` : '');
    }
  };

  createURL = state => `?${qs.stringify(state)}`;

  render() {
    return (
      <InstantSearch
        appId="latency"
        apiKey="6be0576ff61c053d5f9a3225e2a90f76"
        indexName="ikea"
        state={this.state.state}
        onStateChange={this.onStateChange.bind(this)}
        createURL={this.createURL.bind(this)}
      >
        <div>
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
                <RangeRatings attributeName="rating" max={6}/>

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
        </div>
      </InstantSearch>
    );
  }
}

App.propTypes = {
  router: React.PropTypes.object.isRequired,
};

export default withRouter(App);
