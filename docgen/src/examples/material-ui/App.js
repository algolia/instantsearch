/* eslint react/prop-types: 0 */

import injectTapEventPlugin from 'react-tap-event-plugin';
import React from 'react';
import {
  InstantSearch,
  Highlight,
  Configure,
  connectSearchBox,
  connectRefinementList,
  connectHierarchicalMenu,
  connectSortBy,
  connectInfiniteHits,
  connectCurrentRefinements,
} from 'react-instantsearch-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {
  TextField,
  Checkbox,
  Subheader,
  List,
  ListItem,
  FlatButton,
  RaisedButton,
  MenuItem,
  Card,
  Divider,
  CardHeader,
  CardTitle,
  AppBar,
  FontIcon,
  IconMenu,
  Drawer,
  IconButton,
} from 'material-ui';
import SortIcon from 'material-ui/svg-icons/content/sort';
import { withUrlSync } from '../urlSync';

injectTapEventPlugin();

const App = props => (
  <MuiThemeProvider>
    <MaterialUiExample {...props} />
  </MuiThemeProvider>
);

const isMobile = window.innerWidth < 450;
const MaterialUiExample = props => (
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="ikea"
    searchState={props.searchState}
    createURL={props.createURL}
    onSearchStateChange={props.onSearchStateChange}
  >
    <Configure hitsPerPage={20} />
    <Content />
  </InstantSearch>
);

class Content extends React.Component {
  constructor() {
    super();
    this.state = { drawer: !isMobile };
  }

  render() {
    const baseDrawerStyle = {
      transition: 'none',
      top: 120,
    };
    const openDrawerStyle = {
      ...baseDrawerStyle,
      transform: 'translate(0)',
      zIndex: 90,
    };
    const closedDrawerStyle = {
      ...baseDrawerStyle,
      transform: 'translate(-300px)',
    };
    const defaultMarginLeft = isMobile ? window.innerWidth : 300;
    const marginLeft = this.state.drawer ? defaultMarginLeft : 0;
    const displayDrawer = this.state.drawer
      ? openDrawerStyle
      : closedDrawerStyle;
    return (
      <div>
        <AppBar
          title={isMobile ? '' : 'SHOP'}
          className="Header__appBar"
          onLeftIconButtonClick={() => {
            this.setState({ drawer: !this.state.drawer });
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <ConnectedSearchBox />
            <ConnectedSortBy
              items={[
                { value: 'ikea', label: 'Featured' },
                { value: 'ikea_price_desc', label: 'Price (desc)' },
                { value: 'ikea_price_asc', label: 'Price (asc)' },
              ]}
              defaultRefinement="ikea"
            />
          </div>
        </AppBar>
        <div className="main">
          <div className="Sidebar">
            <Drawer
              open={this.state.drawer}
              width={marginLeft}
              containerStyle={displayDrawer}
              containerClassName="Drawer"
            >
              <ConnectedCurrentRefinements />
              <Divider />
              <ConnectedNestedList
                id="Categories"
                attributes={['category', 'sub_category', 'sub_sub_category']}
              />
              <Divider />
              <ConnectedCheckBoxRefinementList
                attribute="materials"
                operator="or"
              />
              <ConnectedCheckBoxRefinementList
                attribute="colors"
                operator="or"
              />
              <Divider />
              <div style={{ marginBottom: 120 }}>
                <ConnectedCurrentRefinements />
              </div>
            </Drawer>
          </div>
          <div
            className="Content__hits"
            style={{
              marginLeft,
              display: 'flex',
              flexDirection: 'column',
              marginTop: 140,
            }}
          >
            <ConnectedHits />
          </div>
        </div>
      </div>
    );
  }
}

const MaterialUiSearchBox = ({ currentRefinement, refine }) => {
  const style = {
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    padding: '0px 10px',
    marginLeft: 0,
    flexGrow: 1,
  };

  const clear = currentRefinement ? (
    <FontIcon
      style={{ color: 'lightgrey' }}
      className="material-icons"
      onClick={() => refine('')}
    >
      {' '}
      clear{' '}
    </FontIcon>
  ) : null;

  return (
    <div style={style}>
      <FontIcon style={{ color: 'lightgrey' }} className="material-icons">
        {' '}
        search{' '}
      </FontIcon>
      <TextField
        value={currentRefinement}
        onChange={e => refine(e.target.value)}
        id="SearchBox"
        hintText="Search for a product..."
        fullWidth={true}
        underlineShow={false}
      />
      {clear}
    </div>
  );
};

const CheckBoxItem = ({ item, refine }) => (
  <ListItem
    primaryText={item.label}
    leftCheckbox={
      <Checkbox
        checked={item.isRefined}
        onCheck={e => {
          e.preventDefault();
          refine(item.value);
        }}
      />
    }
  />
);

const MaterialUiCheckBoxRefinementList = ({
  items,
  attribute,
  refine,
  createURL,
}) => (
  <List>
    <Subheader style={{ fontSize: 18 }}>{attribute.toUpperCase()}</Subheader>
    {items.map(item => (
      <CheckBoxItem
        key={item.label}
        item={item}
        refine={refine}
        createURL={createURL}
      />
    ))}
  </List>
);

const MaterialUiNestedList = function({ id, items, refine }) {
  return (
    <List>
      <Subheader style={{ fontSize: 18 }}>{id.toUpperCase()}</Subheader>
      {items.map((item, idx) => {
        const nestedElements = item.items
          ? item.items.map((child, childIdx) => (
              <ListItem
                primaryText={child.label}
                key={childIdx}
                onClick={e => {
                  e.preventDefault();
                  refine(child.value);
                }}
                style={child.isRefined ? { fontWeight: 700 } : {}}
              />
            ))
          : [];
        return (
          <ListItem
            primaryText={item.label}
            key={idx}
            primaryTogglesNestedList={true}
            nestedItems={nestedElements}
            onClick={e => {
              e.preventDefault();
              refine(item.value);
            }}
            style={item.isRefined ? { fontWeight: 700 } : {}}
          />
        );
      })}
    </List>
  );
};

class MaterialUiSortBy extends React.Component {
  render() {
    return (
      <IconMenu
        iconButtonElement={
          <IconButton>
            <SortIcon color="white" style={{ marginTop: 13 }} />
          </IconButton>
        }
        onChange={this.handleChange}
        value={this.props.currentRefinement}
      >
        {this.props.items.map(item => (
          <MenuItem
            key={item.value}
            value={item.value}
            primaryText={item.label}
            onClick={() => {
              this.props.refine(item.value);
            }}
          />
        ))}
      </IconMenu>
    );
  }
}

function CustomHits({ hits, marginLeft, hasMore, refine }) {
  const cardStyle = isMobile
    ? {
        width: '100%',
        height: 250,
        marginBottom: 10,
        position: 'relative',
      }
    : {
        width: 270,
        height: 250,
        marginBottom: 10,
        marginLeft: 10,
        position: 'relative',
      };

  const containerCardStyle = {
    marginLeft,
    paddingLeft: isMobile ? 0 : 48,
    display: 'flex',
    flexWrap: 'wrap',
  };
  const imageHolderStyle = {
    textAlign: 'center',
  };
  return (
    <div>
      <main id="hits" style={containerCardStyle}>
        {hits.map(hit => (
          <Card key={hit.objectID} style={cardStyle}>
            <CardHeader subtitle={<Highlight attribute="name" hit={hit} />} />
            <div style={imageHolderStyle}>
              <img
                src={`https://res.cloudinary.com/hilnmyskv/image/fetch/h_300,q_100,f_auto/${
                  hit.image
                }`}
                style={{ maxWidth: 120, maxHeight: 120 }}
              />
            </div>
            <CardTitle
              title={
                <span>
                  <Highlight attribute="name" hit={hit} /> - ${hit.price}
                </span>
              }
              subtitle={<Highlight attribute="type" hit={hit} />}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(255, 255, 255, 0.6)',
              }}
              titleStyle={{ fontSize: 16 }}
            />
          </Card>
        ))}
      </main>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <RaisedButton
          onClick={() => {
            if (hasMore) {
              refine();
            }
          }}
          primary
          disabled={!hasMore}
          label="Load More"
          style={{ alignSelf: 'center', marginLeft, marginBottom: 10 }}
        />
      </div>
    </div>
  );
}

function MaterialUiClearAllFilters({ items, refine }) {
  return (
    <FlatButton
      onClick={() => refine(items)}
      label="Clear All"
      primary
      style={{ height: 48, width: '100%' }}
      className="ClearAll"
    />
  );
}

const ConnectedSearchBox = connectSearchBox(MaterialUiSearchBox);

const ConnectedCheckBoxRefinementList = connectRefinementList(
  MaterialUiCheckBoxRefinementList
);

const ConnectedNestedList = connectHierarchicalMenu(MaterialUiNestedList);

const ConnectedSortBy = connectSortBy(MaterialUiSortBy);

const ConnectedHits = connectInfiniteHits(CustomHits);

const ConnectedCurrentRefinements = connectCurrentRefinements(
  MaterialUiClearAllFilters
);

export default withUrlSync(App);
