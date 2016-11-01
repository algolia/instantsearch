/* eslint react/prop-types: 0 */

import injectTapEventPlugin from 'react-tap-event-plugin';
import React from 'react';
import {
  connectSearchBox,
  connectRefinementList,
  connectHierarchicalMenu,
  connectSortBy,
  connectHits,
  connectCurrentRefinements,
  connectPagination,
} from 'react-instantsearch/connectors';
import {InstantSearch} from 'react-instantsearch/dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {
  TextField,
  Checkbox,
  Subheader,
  List,
  ListItem,
  FlatButton,
  MenuItem,
  Card,
  Divider,
  CardHeader, CardTitle,
  AppBar,
  FontIcon,
  IconMenu,
  Drawer,
  Badge,
} from 'material-ui';
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import SortIcon from 'material-ui/svg-icons/content/sort';

injectTapEventPlugin();

export default function App() {
  return (
    <MuiThemeProvider>
      <MaterialUiExample />
    </MuiThemeProvider>
  );
}

const MaterialUiExample = () =>
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="ikea">

    <Content/>
  </InstantSearch>;

const Content = React.createClass({
  getInitialState() {
    return {drawer: true};
  },
  drawerAction () {
    this.setState({drawer: !this.state.drawer});
  },
  render() {
    const baseDrawerStyle = {
      position: 'absolute',
    };
    const openDrawerStyle = {
      ...baseDrawerStyle,
      transform: 'translate(0)',
    };
    const closedDrawerStyle = {
      ...baseDrawerStyle,
      transform: 'translate(-400px)',
    };
    const marginLeft = this.state.drawer ? 300 : 0;
    const displayDrawer = this.state.drawer ? openDrawerStyle : closedDrawerStyle;
    return (
      <div>
        <div className="Header">
          <AppBar
            title="AMAZING"
            iconElementRight={<ConnectedSortBy defaultRefinement="ikea"/>}
            onLeftIconButtonTouchTap={this.drawerAction}
            className="Header__appBar"
          />
        </div>
        <Drawer open={this.state.drawer} width={300} containerStyle={displayDrawer}
                className="Sidebar">
          <div className="Sidebar__header">
            <AppBar title="AMAZING"
                    onLeftIconButtonTouchTap={this.drawerAction}
                    className="Sidebar__header__appBar"
            />
            <ConnectedCurrentRefinements/>
          </div>
          <div className="Sidebar__facets">
            <ConnectedNestedList
              id="categories"
              attributes={[
                'category',
                'sub_category',
                'sub_sub_category',
              ]}
            />
            <Divider />
            <ConnectedCheckBoxRefinementList attributeName="materials" operator="or"/>
            <ConnectedCheckBoxRefinementList attributeName="colors" operator="or"/>
          </div>
        </Drawer>
        <div className="Content">
          <div className="Content__hits">
            <ConnectedSearchBox marginLeft={marginLeft}/>
            <ConnectedHits
              hitsPerPage={20}
              marginLeft={marginLeft}
            />
          </div>
        </div>
        <ConnectedPagination marginLeft={marginLeft}/>
      </div>
    );
  },
});

const MaterialUiSearchBox = ({query, refine, marginLeft}) => {
  const clear = query ?
    <FontIcon style={{color: 'lightgrey'}}
              className="material-icons"
              onTouchTap={() => refine('')}>clear</FontIcon>
    : null;
  return (
    <div style={{marginLeft}} className="Header__searchBox">
      <FontIcon style={{color: 'lightgrey'}} className="material-icons">search</FontIcon>
      <TextField value={query}
                 onChange={e => refine(e.target.value)}
                 id="SearchBox"
                 hintText="Search for a product..."
                 fullWidth={true}
                 underlineShow={false}
      />
      {clear}
    </div>);
};

const CheckBoxItem = ({item, refine}) =>
    <ListItem
              primaryText={item.label}
              leftCheckbox={
                <Checkbox checked={item.isRefined}
                          onCheck={e => {
                            e.preventDefault();
                            refine(item.value);
                          }}
                />}
    />;

const MaterialUiCheckBoxRefinementList = ({items, attributeName, refine, createURL}) =>
    <List>
      <Subheader style={{fontSize: 18}}>{attributeName.toUpperCase()}</Subheader>
      {items.map(item =>
        <CheckBoxItem
          key={item.label}
          item={item}
          refine={refine}
          createURL={createURL}
        />
      )}
    </List>
  ;

const MaterialUiNestedList = function ({id, items, refine}) {
  return <List>
    <Subheader style={{fontSize: 18}}>{id.toUpperCase()}</Subheader>
    {items.map((item, idx) => {
      const nestedElements = item.children ? item.children.map((child, childIdx) =>
        <ListItem
          primaryText={child.label}
          key={childIdx}
          onClick={e => {
            e.preventDefault();
            refine(child.value);
          }}
          style={child.isRefined ? {fontWeight: 700} : {}}
        />
      ) : [];
      return <ListItem
        primaryText={item.label}
        key={idx}
        primaryTogglesNestedList={true}
        nestedItems={nestedElements}
        onClick={e => {
          e.preventDefault();
          refine(item.value);
        }}
        style={item.isRefined ? {fontWeight: 700} : {}}
      />;
    }
    )}
  </List>;
};

const MaterialUiSortBy = React.createClass({

  getInitialState() {
    return {value: this.props.defaultRefinement};
  },

  handleChange (ev, index, value) {
    this.setState({value});
  },

  render() {
    return (
      <IconMenu
        iconButtonElement={<SortIcon style={{marginTop: 13, color: 'white'}}/>}
        onChange={this.handleChange}
        value={this.state.value}
      >
        <MenuItem
          value="ikea"
          primaryText="Featured"
          onTouchTap={e => {
            e.preventDefault();
            this.props.refine('ikea');
          }}/>
        <MenuItem
          value="ikea_price_asc"
          primaryText="Price (asc)"
          onTouchTap={e => {
            e.preventDefault();
            this.props.refine('ikea_price_asc');
          }}/>
        <MenuItem
          value="ikea_price_desc"
          primaryText="Price (desc)"
          onTouchTap={e => {
            e.preventDefault();
            this.props.refine('ikea_price_desc');
          }}/>
      </IconMenu>
    );
  },

});

function CustomHits({hits, marginLeft}) {
  const cardStyle = {
    width: 270,
    height: 250,
    marginBottom: 10,
    marginLeft: 10,
    position: 'relative',
  };
  const imageHolderStyle = {
    textAlign: 'center',
  };
  return (
    <main id="hits" style={{marginLeft}} className="Content__hits__card">
      {hits.map((hit, idx) =>
        <Card key={idx} style={cardStyle}>
          <CardHeader
            subtitle={<span dangerouslySetInnerHTML={{__html: hit._highlightResult.name.value}}/>}
          />
          <div style={imageHolderStyle}>
            <img src={hit.image} className="Content__hits__card__img"/>
          </div>
          <CardTitle
            title={<span dangerouslySetInnerHTML={{__html: `${hit._highlightResult.name.value} - $${hit.price}`}}/>}
            subtitle={<span dangerouslySetInnerHTML={{__html: hit._highlightResult.type.value}}/>}
            style={{position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255, 255, 255, 0.6)'}}
            titleStyle={{fontSize: 16}}
          />
        </Card>
      )}
    </main>
  );
}

function MaterialUiClearAllFilters({filters, refine}) {
  return (
    <FlatButton
      onTouchTap={() => refine(filters)}
      label="Clear All"
      style={{height: 48, width: 300, backgroundColor: 'white'}}
    />
  );
}

const MaterialUiBottomNavigation = React.createClass({

  getInitialState() {
    return {selectedIndex: 0};
  },

  select(index) {
    this.setState({selectedIndex: index});
  },

  render() {
    const ending = <FontIcon className="material-icons">fast_forward</FontIcon>;
    const beginning = <FontIcon className="material-icons">fast_rewind</FontIcon>;
    const next = <FontIcon className="material-icons">keyboard_arrow_right</FontIcon>;
    const previous = <FontIcon className="material-icons">keyboard_arrow_left</FontIcon>;
    return (
      <div style={{marginLeft: this.props.marginLeft, marginTop: 30}}>
        <BottomNavigation>
          <BottomNavigationItem
            label="First Page"
            icon={beginning}
            onTouchTap={e => {
              e.preventDefault();
              this.props.refine(0);
            }}
            disabled={this.props.page <= 0}
          />
          <BottomNavigationItem
            label="Previous Page"
            icon={previous}
            onTouchTap={e => {
              e.preventDefault();
              this.props.refine(this.props.page - 1);
            }}
            disabled={this.props.page <= 0}
          />
          <BottomNavigationItem
            icon={<FontIcon><Badge
              badgeContent={this.props.page}
              secondary={true}
            /></FontIcon>}
          />
          <BottomNavigationItem
            label="Next Page"
            icon={next}
            onTouchTap={e => {
              e.preventDefault();
              this.props.refine(this.props.page + 1);
            }}
            disabled={this.props.page >= this.props.nbPages - 1}
          />
          <BottomNavigationItem
            label="Last Page"
            icon={ending}
            onTouchTap={e => {
              e.preventDefault();
              this.props.refine(this.props.nbPages - 1);
            }}
            disabled={this.props.page >= this.props.nbPages - 1}
          />
        </BottomNavigation>
      </div>
    );
  },
});

const ConnectedSearchBox = connectSearchBox(MaterialUiSearchBox);

const ConnectedCheckBoxRefinementList = connectRefinementList(MaterialUiCheckBoxRefinementList);

const ConnectedNestedList = connectHierarchicalMenu(MaterialUiNestedList);

const ConnectedSortBy = connectSortBy(MaterialUiSortBy);

const ConnectedHits = connectHits(CustomHits);

const ConnectedCurrentRefinements = connectCurrentRefinements(MaterialUiClearAllFilters);

const ConnectedPagination = connectPagination(MaterialUiBottomNavigation);
