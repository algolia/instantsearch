import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import InstantSearch from '../../components/InstantSearch';
import createInstantSearch from '../createInstantSearch';
import version from '../version';

Enzyme.configure({ adapter: new Adapter() });

describe('createInstantSearch', () => {
  const algoliaClient = { addAlgoliaAgent: jest.fn() };
  const algoliaClientFactory = jest.fn(() => algoliaClient);
  const CustomInstantSearch = createInstantSearch(algoliaClientFactory, {
    Root: 'div',
  });

  beforeEach(() => {
    algoliaClient.addAlgoliaAgent.mockClear();
    algoliaClientFactory.mockClear();
  });

  it('wraps InstantSearch', () => {
    const wrapper = shallow(
      <CustomInstantSearch appId="app" apiKey="key" indexName="name" />
    );

    const {
      algoliaClient, // eslint-disable-line no-shadow
      searchClient,
      ...propsWithoutClient
    } = wrapper.props();

    expect(wrapper.is(InstantSearch)).toBe(true);
    expect(propsWithoutClient).toMatchSnapshot();
    expect(wrapper.props().algoliaClient).toBe(algoliaClient);
    expect(wrapper.props().searchClient).toBe(searchClient);
  });

  it('creates an algolia client using the provided factory', () => {
    shallow(<CustomInstantSearch appId="app" apiKey="key" indexName="name" />);

    expect(algoliaClientFactory).toHaveBeenCalledTimes(1);
    expect(algoliaClientFactory).toHaveBeenCalledWith('app', 'key');
    expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
    expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledWith(
      `react-instantsearch ${version}`
    );
  });

  it('throws if algoliaClient is given with searchClient', () => {
    const trigger = () =>
      shallow(
        <CustomInstantSearch
          indexName="name"
          searchClient={algoliaClient}
          algoliaClient={algoliaClient}
        />
      );

    expect(() => trigger()).toThrow();
  });

  it('throws if appId is given with searchClient', () => {
    const trigger = () =>
      shallow(
        <CustomInstantSearch
          indexName="name"
          appId="appId"
          searchClient={algoliaClient}
        />
      );

    expect(() => trigger()).toThrow();
  });

  it('throws if apiKey is given with searchClient', () => {
    const trigger = () =>
      shallow(
        <CustomInstantSearch
          indexName="name"
          apiKey="apiKey"
          searchClient={algoliaClient}
        />
      );

    expect(() => trigger()).toThrow();
  });

  it('updates the algoliaClient when appId or apiKey changes', () => {
    const wrapper = shallow(
      <CustomInstantSearch appId="app" apiKey="key" indexName="name" />
    );

    wrapper.setProps({ appId: 'app2', apiKey: 'key' });
    wrapper.setProps({ appId: 'app', apiKey: 'key2' });

    expect(algoliaClientFactory).toHaveBeenCalledTimes(3);
    expect(algoliaClientFactory.mock.calls[1]).toEqual(['app2', 'key']);
    expect(algoliaClientFactory.mock.calls[2]).toEqual(['app', 'key2']);
  });

  it('uses the provided searchClient', () => {
    const wrapper = shallow(
      <CustomInstantSearch searchClient={algoliaClient} indexName="name" />
    );

    expect(algoliaClientFactory).toHaveBeenCalledTimes(0);
    expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
    expect(wrapper.props().searchClient).toBe(algoliaClient);
  });

  it('uses the provided algoliaClient', () => {
    const wrapper = shallow(
      <CustomInstantSearch algoliaClient={algoliaClient} indexName="name" />
    );

    expect(algoliaClientFactory).toHaveBeenCalledTimes(0);
    expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
    expect(wrapper.props().algoliaClient).toBe(algoliaClient);
  });

  it('does not throw if searchClient does not have a `addAlgoliaAgent()` method', () => {
    const client = {};
    const trigger = () =>
      shallow(<CustomInstantSearch indexName="name" searchClient={client} />);

    expect(() => trigger()).not.toThrow();
  });

  it('does not throw if algoliaClient does not have a `addAlgoliaAgent()` method', () => {
    const client = {};
    const trigger = () =>
      shallow(<CustomInstantSearch indexName="name" algoliaClient={client} />);

    expect(() => trigger()).not.toThrow();
  });

  it('updates the algoliaClient when provided algoliaClient is passed down', () => {
    const newAlgoliaClient = {
      addAlgoliaAgent: jest.fn(),
    };

    const wrapper = shallow(
      <CustomInstantSearch algoliaClient={algoliaClient} indexName="name" />
    );

    expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);

    wrapper.setProps({
      algoliaClient: newAlgoliaClient,
    });

    expect(wrapper.props().algoliaClient).toBe(newAlgoliaClient);
    expect(newAlgoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
  });

  it('updates the searchClient when provided searchClient is passed down', () => {
    const newAlgoliaClient = {
      addAlgoliaAgent: jest.fn(),
    };

    const wrapper = shallow(
      <CustomInstantSearch searchClient={algoliaClient} indexName="name" />
    );

    expect(algoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);

    wrapper.setProps({
      searchClient: newAlgoliaClient,
    });

    expect(wrapper.props().searchClient).toBe(newAlgoliaClient);
    expect(newAlgoliaClient.addAlgoliaAgent).toHaveBeenCalledTimes(1);
  });

  it('does not throw when algoliaClient gets updated and does not have a `addAlgoliaAgent()` method', () => {
    const client = {};
    const makeWrapper = () =>
      shallow(<CustomInstantSearch indexName="name" algoliaClient={client} />);

    expect(() => {
      makeWrapper().setProps({
        algoliaClient: client,
      });
    }).not.toThrow();
  });

  it('does not throw when searchClient gets updated and does not have a `addAlgoliaAgent()` method', () => {
    const client = {};
    const makeWrapper = () =>
      shallow(<CustomInstantSearch indexName="name" searchClient={client} />);

    expect(() => {
      makeWrapper().setProps({
        searchClient: client,
      });
    }).not.toThrow();
  });

  it('expect to create InstantSearch with a custom root props', () => {
    const root = {
      Root: 'span',
      props: {
        style: {
          flex: 1,
        },
      },
    };

    const wrapper = shallow(
      <CustomInstantSearch indexName="name" root={root} />
    );

    const {
      algoliaClient, // eslint-disable-line no-shadow, no-unused-vars
      searchClient, // eslint-disable-line no-unused-vars
      ...propsWithoutClient
    } = wrapper.props();

    expect(wrapper.props().root).toEqual(root);
    expect(propsWithoutClient).toMatchSnapshot();
  });
});
