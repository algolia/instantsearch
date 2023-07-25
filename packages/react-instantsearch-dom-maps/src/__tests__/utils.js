import PropTypes from 'prop-types';

import { createFakeMarkerInstance } from '../../test/mockGoogleMaps';
import * as utils from '../utils';

describe('utils', () => {
  describe('registerEvents', () => {
    it('expect to add listeners from events', () => {
      const onClick = () => {};
      const onMouseMove = () => {};
      const instance = createFakeMarkerInstance();

      const events = {
        onClick: 'click',
        onMouseMove: 'mousemove',
      };

      const props = {
        onClick,
        onMouseMove,
      };

      utils.registerEvents(events, props, instance);

      expect(instance.addListener).toHaveBeenCalledTimes(2);

      expect(instance.addListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );

      expect(instance.addListener).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function)
      );
    });

    it('expect to add listeners with event & marker', () => {
      const onClick = jest.fn();
      const onMouseMove = jest.fn();
      const instance = createFakeMarkerInstance();
      const listeners = [];

      instance.addListener.mockImplementation((event, listener) =>
        listeners.push(listener)
      );

      const events = {
        onClick: 'click',
        onMouseMove: 'mousemove',
      };

      const props = {
        onClick,
        onMouseMove,
      };

      utils.registerEvents(events, props, instance);

      listeners.forEach((listener) => listener({ type: 'event' }));

      expect(onClick).toHaveBeenCalledWith({
        event: { type: 'event' },
        marker: instance,
      });

      expect(onMouseMove).toHaveBeenCalledWith({
        event: { type: 'event' },
        marker: instance,
      });
    });

    it('expect to only add listeners listed from events', () => {
      const onClick = () => {};
      const onMouseEnter = () => {};
      const instance = createFakeMarkerInstance();

      const events = {
        onClick: 'click',
        onMouseMove: 'mousemove',
      };

      const props = {
        onClick,
        onMouseEnter,
      };

      utils.registerEvents(events, props, instance);

      expect(instance.addListener).toHaveBeenCalledTimes(1);
      expect(instance.addListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );
    });

    it('expect to only add listeners listed from props', () => {
      const onClick = () => {};
      const instance = createFakeMarkerInstance();

      const events = {
        onClick: 'click',
        onMouseMove: 'mousemove',
      };

      const props = {
        onClick,
      };

      utils.registerEvents(events, props, instance);

      expect(instance.addListener).toHaveBeenCalledTimes(1);
      expect(instance.addListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      );
    });

    it('expect to return a function that remove the listeners', () => {
      const onClick = () => {};
      const onMouseMove = () => {};
      const remove = jest.fn();
      const instance = createFakeMarkerInstance();

      instance.addListener.mockImplementation(() => ({
        remove,
      }));

      const events = {
        onClick: 'click',
        onMouseMove: 'mousemove',
      };

      const props = {
        onClick,
        onMouseMove,
      };

      const removeEventListeners = utils.registerEvents(
        events,
        props,
        instance
      );

      expect(remove).toHaveBeenCalledTimes(0);

      removeEventListeners();

      expect(remove).toHaveBeenCalledTimes(2);
    });
  });

  describe('createListenersPropTypes', () => {
    it('expect to return an object with listeners propType from event types', () => {
      const events = {
        onClick: '',
        onMouseMove: '',
      };

      const expectation = {
        onClick: PropTypes.func,
        onMouseMove: PropTypes.func,
      };

      const actual = utils.createListenersPropTypes(events);

      expect(actual).toEqual(expectation);
    });

    it('expect to return an empty object from empty event types', () => {
      const events = {};

      const expectation = {};
      const actual = utils.createListenersPropTypes(events);

      expect(actual).toEqual(expectation);
    });
  });

  describe('createFilterProps', () => {
    it('expect to return an object without excluded keys', () => {
      const excludes = ['children', 'onClick'];

      const props = {
        label: 'Title',
        onClick: () => {},
        children: '<div />',
      };

      const expectation = {
        label: 'Title',
      };

      const filterProps = utils.createFilterProps(excludes);
      const actual = filterProps(props);

      expect(actual).toEqual(expectation);
    });

    it('expect to return the given props when excluded keys is empty', () => {
      const onClick = () => {};
      const excludes = [];

      const props = {
        children: '<div />',
        onClick,
      };

      const expectation = {
        children: '<div />',
        onClick,
      };

      const filterProps = utils.createFilterProps(excludes);
      const actual = filterProps(props);

      expect(actual).toEqual(expectation);
    });

    it('expect to return an empty object when all keys are excluded', () => {
      const excludes = ['children', 'onClick'];

      const props = {
        onClick: () => {},
        children: '<div />',
      };

      const expectation = {};
      const filterProps = utils.createFilterProps(excludes);
      const actual = filterProps(props);

      expect(actual).toEqual(expectation);
    });
  });
});
