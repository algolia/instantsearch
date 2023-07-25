/**
 * @jest-environment jsdom
 */

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import { createSerializer } from 'enzyme-to-json';
import React from 'react';

import VoiceSearch from '../VoiceSearch';

import type { InnerComponentProps } from '../VoiceSearch';

expect.addSnapshotSerializer(createSerializer() as any);
Enzyme.configure({ adapter: new Adapter() });

const mockGetState = jest.fn().mockImplementation(() => ({}));
const mockIsBrowserSupported = jest.fn().mockImplementation(() => true);
const mockIsListening = jest.fn();
const mockToggleListening = jest.fn();
const mockDispose = jest.fn();

jest.mock('../../lib/voiceSearchHelper', () => {
  return () => {
    return {
      getState: mockGetState,
      isBrowserSupported: mockIsBrowserSupported,
      isListening: mockIsListening,
      toggleListening: mockToggleListening,
      dispose: mockDispose,
    };
  };
});

describe('VoiceSearch', () => {
  afterEach(() => {
    mockGetState.mockImplementation(() => ({}));
    mockIsBrowserSupported.mockImplementation(() => true);
    mockIsListening.mockClear();
    mockToggleListening.mockClear();
  });

  describe('button', () => {
    it('calls toggleListening when button is clicked', () => {
      const wrapper = mount(<VoiceSearch />);
      wrapper.find('button').simulate('click');
      expect(mockToggleListening).toHaveBeenCalledTimes(1);
    });
  });

  describe('Rendering', () => {
    it('with default props', () => {
      const wrapper = mount(<VoiceSearch />);
      expect(wrapper).toMatchSnapshot();
    });

    it('with custom component for button with isListening: false', () => {
      const customButtonText = ({ isListening }: { isListening: boolean }) =>
        isListening ? 'Stop' : 'Start';

      const wrapper = mount(
        <VoiceSearch buttonTextComponent={customButtonText} />
      );
      expect(wrapper.find('button').text()).toBe('Start');
    });

    it('with custom component for button with isListening: true', () => {
      const customButtonText = ({ isListening }: { isListening: boolean }) =>
        isListening ? 'Stop' : 'Start';
      mockIsListening.mockImplementation(() => true);

      const wrapper = mount(
        <VoiceSearch buttonTextComponent={customButtonText} />
      );
      expect(wrapper.find('button').text()).toBe('Stop');
    });

    it('renders a disabled button when the browser is not supported', () => {
      mockIsBrowserSupported.mockImplementation(() => false);
      const wrapper = mount(<VoiceSearch />);
      expect(wrapper.find('button').prop('title')).toBe(
        'Search by voice (not supported on this browser)'
      );
      expect(wrapper.find('button').prop('disabled')).toBe(true);
    });

    it('with custom template for status', () => {
      const customStatus = ({
        status,
        errorCode,
        isListening,
        transcript,
        isSpeechFinal,
        isBrowserSupported,
      }: InnerComponentProps) => (
        <div>
          <p>status: {status}</p>
          <p>errorCode: {errorCode}</p>
          <p>isListening: {isListening ? 'true' : 'false'}</p>
          <p>transcript: {transcript}</p>
          <p>isSpeechFinal: {isSpeechFinal ? 'true' : 'false'}</p>
          <p>isBrowserSupported: {isBrowserSupported ? 'true' : 'false'}</p>
        </div>
      );

      mockIsListening.mockImplementation(() => true);
      mockGetState.mockImplementation(() => ({
        status: 'recognizing',
        transcript: 'Hello',
        isSpeechFinal: false,
        errorCode: undefined,
      }));

      const wrapper = mount(<VoiceSearch statusComponent={customStatus} />);
      expect(wrapper.find('.ais-VoiceSearch-status')).toMatchSnapshot();
    });

    it('calls voiceSearchHelper.dispose() on unmount', () => {
      const wrapper = mount(<VoiceSearch />);
      wrapper.find('button').simulate('click');
      wrapper.unmount();
      expect(mockDispose).toHaveBeenCalledTimes(1);
    });
  });
});
