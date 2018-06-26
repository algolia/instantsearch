import React from 'react';
import { RawBreadcrumb as Breadcrumb } from '../Breadcrumb';
import renderer from 'react-test-renderer';

describe('Breadcrumb', () => {
  it('should render <Breadcrumb />', () => {
    const props = {
      createURL: data => {
        JSON.stringify(data);
      },
      refine: () => {},
      items: [],
      cssClasses: {
        root: 'root',
        noRefinement: 'no-refinement',
        list: 'list',
        item: 'item',
        selectedItem: 'selectedItem',
        link: 'link',
        separator: 'separator',
      },
      templateProps: {
        templates: {
          home: 'home',
          separator: ' > ',
        },
      },
    };
    const tree = renderer.create(<Breadcrumb {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render <Breadcrumb /> with items', () => {
    const props = {
      createURL: data => {
        JSON.stringify(data);
      },
      refine: () => {},
      items: [
        {
          value: 'val0',
          name: 'name0',
        },
        {
          value: 'val1',
          name: 'name1',
        },
      ],
      cssClasses: {
        root: 'root',
        noRefinement: 'no-refinement',
        list: 'list',
        item: 'item',
        selectedItem: 'selectedItem',
        link: 'link',
        separator: 'separator',
      },
      templateProps: {
        templates: {
          home: 'home',
          separator: ' > ',
        },
      },
    };
    const tree = renderer.create(<Breadcrumb {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
