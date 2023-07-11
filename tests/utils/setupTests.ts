import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';
import { createSerializer } from 'enzyme-to-json';
import htmlSerializer from 'jest-serializer-html/createSerializer';
import '@testing-library/jest-dom/extend-expect';
import * as matchers from './matchers';
import { warnCache } from '../../packages/react-instantsearch-hooks/src/lib/warn';
import {
  Vue2,
  isVue2,
  // @ts-ignore (vue is not typed)
} from '../../packages/vue-instantsearch/src/util/vue-compat';

Enzyme.configure({ adapter: new Adapter() });
expect.addSnapshotSerializer(createSerializer({ mode: 'deep' }) as any);
expect.addSnapshotSerializer(htmlSerializer());
expect.extend(matchers);

// We hide console infos and warnings to not pollute the test logs.
global.console.info = jest.fn();
global.console.warn = jest.fn();

// https://github.com/jsdom/jsdom/issues/1695
window.Element.prototype.scrollIntoView = jest.fn();

beforeEach(() => {
  // We reset the log's cache for our log assertions to be isolated in each test.
  warnCache.current = {};
});

if (isVue2) {
  Vue2.config.productionTip = false;
}
