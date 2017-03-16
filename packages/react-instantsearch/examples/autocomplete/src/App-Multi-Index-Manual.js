import React from 'react';
import {InstantSearch, Configure, Index, SearchBox, Highlight} from 'react-instantsearch/dom';
import {connectHits} from 'react-instantsearch/connectors';
import 'react-instantsearch-theme-algolia/style.css';
import {isEqual, findIndex} from 'lodash';

class App extends React.Component {
  constructor() {
    super();
    this.state = {display: false, indices: [{index: 'players', hits: []}, {index: 'teams', hits: []}], selectedIndex: 0, selectedHit: 0};
  }
  onRender(index, hits) {
    const idx = findIndex(this.state.indices, t => t.index === index);
    const indices = this.state.indices;
    indices[idx] = {index, hits};
    this.setState({indices});
  }
  onFocus = e => {
    this.setState({display: true});
  }
  onBlur = e => {
    this.setState({display: false});
  }
  onKeyDown = e => {
    switch (e.key) {
    case 'ArrowDown':
      if (this.state.indices[this.state.selectedIndex].hits.length === this.state.selectedHit + 1) {
        if (this.state.indices.length !== this.state.selectedIndex + 1) {
          this.setState({selectedHit: 0, selectedIndex: this.state.selectedIndex + 1});
        }
      } else {
        this.setState({selectedHit: this.state.selectedHit + 1});
      }
      break;
    case 'ArrowUp':
      if (this.state.selectedHit === 0) {
        if (this.state.selectedIndex > 0) {
          this.setState({selectedHit: this.state.indices[this.state.selectedIndex - 1].hits.length - 1, selectedIndex: this.state.selectedIndex - 1});
        }
      } else {
        this.setState({selectedHit: this.state.selectedHit - 1});
      }
      break;
    case 'ArrowRight':
      if (this.state.indices.length !== this.state.selectedIndex + 1) {
        this.setState({selectedIndex: this.state.selectedIndex + 1, selectedHit: 0});
      }
      break;
    case 'ArrowLeft':
      if (this.state.selectedIndex !== 0) {
        this.setState({selectedIndex: this.state.selectedIndex - 1, selectedHit: 0});
      }
      break;
    }
  }
  render() {
    const selectedItem = this.state.indices[this.state.selectedIndex]
        ? this.state.indices[this.state.selectedIndex].hits[this.state.selectedHit]
        : {};

    return (
      <InstantSearch
        appId="latency"
        apiKey="6be0576ff61c053d5f9a3225e2a90f76"
        indexName="players">
        <div onKeyDown={this.onKeyDown.bind(this)} onClick={this.onFocus.bind(this)} onFocus={this.onFocus.bind(this)} >
          <SearchBox />
        </div>
        <Configure hitsPerPage={3} />
        <div className={this.state.display ? '' : 'disabled'} onMouseLeave={this.onBlur.bind(this)} ><div className="title">
          <div>Players</div>
          <div>Team</div>
        </div>
          <div className="autocomplete">
            <Index indexName="players">
              <ConnectHitsPlayers indexName="players" onRender={this.onRender.bind(this)} selectedItem={selectedItem} />
            </Index>
            <Index indexName="teams">
              <ConnectHitsTeam indexName="teams" onRender={this.onRender.bind(this)} selectedItem={selectedItem} />
            </Index>
          </div></div>
      </InstantSearch >
    );
  }
}

class Players extends React.Component {

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.hits, nextProps.hits)) {
      nextProps.onRender(nextProps.indexName, nextProps.hits);
    }
  }

  render() {
    const hits = this.props.hits.length > 0 ? this.props.hits.map(hit => {
      const selected = this.props.selectedItem && this.props.selectedItem.objectID === hit.objectID ? 'highlighted' : '';
      return <div className={`content ${selected}`}>
               <Highlight attributeName="name" hit={hit}/>
               <Highlight attributeName="team" hit={hit}/>
             </div>;
    }) : <div>No matching players</div>;
    return <div className="block">
            {hits}
          </div>;
  }
}

class Team extends React.Component {

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.hits, nextProps.hits)) {
      nextProps.onRender(nextProps.indexName, nextProps.hits);
    }
  }

  render() {
    const hits = this.props.hits.length > 0 ? this.props.hits.map(hit => {
      const selected = this.props.selectedItem && this.props.selectedItem.objectID === hit.objectID ? 'highlighted' : '';
      return <a href="ty" onClick={e => {
        e.stopPropagation();
        console.log('onClick');
      }}><div className={`content ${selected}`}>
               <Highlight attributeName="name" hit={hit}/>
               <Highlight attributeName="location" hit={hit}/>
             </div></a>;
    }) : <div>No Matching teams</div>;
    return <div className="block">
            {hits}
          </div>;
  }
}
const ConnectHitsTeam = connectHits(Team);
const ConnectHitsPlayers = connectHits(Players);

export default App;

