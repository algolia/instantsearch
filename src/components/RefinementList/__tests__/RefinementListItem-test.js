import React from 'react';
import {createRenderer} from 'react-dom/test-utils';
import RefinementListItem from '../RefinementListItem';
import Template from '../../Template';
import sinon from 'sinon';
import expect from 'expect';
import expectJSX from 'expect-jsx';
expect.extend(expectJSX);
describe('RefinementListItem', () => {
  let renderer;
  let props;

  beforeEach(() => {
    props = {
      facetValue: 'Hello',
      facetValueToRefine: 'wi',
      isRefined: false,
      handleClick: sinon.spy(),
      itemClassName: 'item class',
      templateData: {template: 'data'},
      templateKey: 'item key',
      templateProps: {template: 'props'},
      subItems: <div/>,
    };
    renderer = createRenderer();
  });

  it('renders an item', () => {
    const out = render(props);

    expect(out).toEqualJSX(
      <div
        className={props.itemClassName}
        onClick={props.handleClick}
      >
        <Template
          data={props.templateData}
          templateKey={props.templateKey}
          {...props.templateProps}
        />
        {props.subItems}
      </div>
    );
  });

  it('calls the right function', () => {
    const out = render(props);
    out.props.onClick();
    expect(props.handleClick.calledOnce).toBe(true);
  });

  function render(askedProps) {
    renderer.render(<RefinementListItem {...askedProps} />);
    return renderer.getRenderOutput();
  }
});
