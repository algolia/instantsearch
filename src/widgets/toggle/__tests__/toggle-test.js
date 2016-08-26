/* eslint-env mocha */

import expect from 'expect';
import sinon from 'sinon';
import toggle from '../toggle';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('toggle()', () => {
  context('bad usage', () => {
    it('throws when no container', () => {
      expect(() => {
        toggle();
      }).toThrow(/Container must be `string` or `HTMLElement`/);
    });

    it('throws when no attributeName', () => {
      expect(() => {
        toggle({container: document.createElement('div')});
      }).toThrow(/Usage:/);
    });

    it('throws when no label', () => {
      expect(() => {
        toggle({container: document.createElement('div'), attributeName: 'Hello'});
      }).toThrow(/Usage:/);
    });
  });

  context('good usage', () => {
    let autoHideContainer;
    let headerFooter;
    let container;
    let widget;
    let attributeName;
    let label;
    let currentToggleImplem;
    let currentToggle;
    let legacyToggleImplem;
    let legacyToggle;

    beforeEach(() => {
      autoHideContainer = sinon.stub();
      headerFooter = sinon.stub();

      currentToggleImplem = {getConfiguration: sinon.spy(), init: sinon.spy(), render: sinon.spy()};
      legacyToggleImplem = {getConfiguration: sinon.spy(), init: sinon.spy(), render: sinon.spy()};
      currentToggle = sinon.stub().returns(currentToggleImplem);
      legacyToggle = sinon.stub().returns(legacyToggleImplem);

      toggle.__Rewire__('autoHideContainerHOC', autoHideContainer);
      toggle.__Rewire__('currentToggle', currentToggle);
      toggle.__Rewire__('legacyToggle', legacyToggle);
      toggle.__Rewire__('headerFooterHOC', headerFooter);

      container = document.createElement('div');
      label = 'Hello, ';
      attributeName = 'world!';
      widget = toggle({container, attributeName, label});
    });

    it('uses currentToggle implementation by default', () => {
      widget.getConfiguration(1, 2);
      expect(currentToggle.calledOnce).toBe(true);
      expect(currentToggleImplem.getConfiguration.calledWithExactly(1, 2)).toBe(true);
      widget.init(1);
      widget.render(2);
      expect(currentToggleImplem.init.calledWithExactly(1)).toBe(true);
      expect(currentToggleImplem.render.calledWithExactly(2)).toBe(true);
    });

    it('uses legacyToggle implementation when corresponding facetsRefinements set previously', () => {
      const currentSearchParameters = {facetsRefinements: {[attributeName]: ['yes']}};
      widget.getConfiguration(currentSearchParameters, 2);
      expect(legacyToggle.calledOnce).toBe(true);
      expect(legacyToggleImplem.getConfiguration.calledWithExactly(currentSearchParameters, 2)).toBe(true);
      widget.init(1);
      expect(legacyToggleImplem.init.calledWithExactly(1)).toBe(true);
      widget.render(2);
      expect(legacyToggleImplem.render.calledWithExactly(2)).toBe(true);
    });

    it('uses legacyToggle implementation when corresponding facetsRefinements set in the url', () => {
      const searchParametersFromUrl = {facetsRefinements: {[attributeName]: ['yes']}};
      widget.getConfiguration(1, searchParametersFromUrl);
      expect(legacyToggle.calledOnce).toBe(true);
      expect(legacyToggleImplem.getConfiguration.calledWithExactly(1, searchParametersFromUrl)).toBe(true);
      widget.init(1);
      expect(legacyToggleImplem.init.calledWithExactly(1)).toBe(true);
      widget.render(2);
      expect(legacyToggleImplem.render.calledWithExactly(2)).toBe(true);
    });

    it('uses autoHideContainer() and headerFooter()', () => {
      expect(autoHideContainer.calledOnce).toBe(true);
      expect(headerFooter.calledOnce).toBe(true);
      expect(headerFooter.calledBefore(autoHideContainer)).toBe(true);
    });

    afterEach(() => {
      toggle.__ResetDependency__('autoHideContainerHOC');
      toggle.__ResetDependency__('headerFooterHOC');
      toggle.__ResetDependency__('currentToggle');
      toggle.__ResetDependency__('legacyToggle');
    });
  });
});
