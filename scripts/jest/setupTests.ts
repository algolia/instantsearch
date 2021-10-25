import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';
import { createSerializer } from 'enzyme-to-json';
import '@testing-library/jest-dom/extend-expect';
import { toWarnDev } from './matchers';

Enzyme.configure({ adapter: new Adapter() });
expect.addSnapshotSerializer(createSerializer({ mode: 'deep' }) as any);
expect.extend(toWarnDev);

// We hide console infos and warnings to not pollute the test logs.
global.console.info = jest.fn();
global.console.warn = jest.fn();
