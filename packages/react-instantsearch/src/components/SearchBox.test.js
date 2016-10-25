/* eslint-env jest, jasmine */

import React from 'react';
import renderer from 'react-test-renderer';

import SearchBox from './SearchBox';

let tree;

describe('SearchBox', () => {
  it('applies its default props', () => {
    tree = renderer.create(
      <SearchBox refine={() => null} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('transfers the autoFocus prop to the underlying input element', () => {
    tree = renderer.create(
      <SearchBox refine={() => null} autoFocus />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('treats its query prop as its input value', () => {
    const inst = renderer.create(
      <SearchBox refine={() => null} query="QUERY1" />
    );
    expect(inst.toJSON()).toMatchSnapshot();

    inst.update(
      <SearchBox refine={() => null} query="QUERY2" />
    );
    expect(inst.toJSON()).toMatchSnapshot();
  });
  it('lets you customize its theme', () => {
    tree = renderer.create(
      <SearchBox
        refine={() => null}
        theme={{
          root: 'ROOT',
          wrapper: 'WRAPPER',
          input: 'INPUT',
          submit: 'SUBMIT',
          reset: 'RESET',
        }}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('lets you customize its translations', () => {
    tree = renderer.create(
      <SearchBox
        refine={() => null}
        translations={{
          submit: 'SUBMIT',
          reset: 'RESET',
          submitTitle: 'SUBMIT_TITLE',
          resetTitle: 'RESET_TITLE',
          placeholder: 'PLACEHOLDER',
        }}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
