import React from 'react';
import {InstantSearch} from '../packages/react-instantsearch';

const Wrapper = props =>
  <InstantSearch
    className="container-fluid"
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="ikea"
  >
    {props.children}
  </InstantSearch>;

Wrapper.propTypes = {
  children: React.PropTypes.node,
};

export default Wrapper;
