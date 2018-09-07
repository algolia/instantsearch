import React from 'react';
import { shallow } from 'enzyme';
import { RawStats as Stats } from '../Stats';
import renderer from 'react-test-renderer';
import defaultTemplates from '../../../widgets/stats/defaultTemplates';

describe('Stats', () => {
  it('should render <Template data= />', () => {
    const out = shallow(<Stats {...getProps()} templateProps={{}} />);

    const defaultProps = {
      cssClasses: {},
      hasManyResults: true,
      hasNoResults: false,
      hasOneResult: false,
    };

    expect(out.props().children.props.data).toMatchObject(defaultProps);
    expect(out).toMatchSnapshot();
  });

  it('should render <Stats /> with custom CSS classes', () => {
    const tree = renderer
      .create(
        <Stats
          templateProps={{
            templates: defaultTemplates,
          }}
          nbHits={1}
          cssClasses={{ root: 'my-root', text: 'my-text' }}
        />
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  function getProps(extraProps = {}) {
    return {
      cssClasses: {},
      hitsPerPage: 10,
      nbHits: 1234,
      nbPages: 124,
      page: 0,
      processingTimeMS: 42,
      query: 'a query',
      ...extraProps,
    };
  }
});
