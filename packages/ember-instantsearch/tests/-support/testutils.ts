/**
 * The parts of `@instantsearch/testutils` that the shared suites use.
 *
 * The full entry also imports Enzyme and React,
 * which do not run in a browser without a bundle of their own.
 */
export { castToJestMock } from '../../../../tests/utils/castToJestMock';
export { normalizeSnapshot } from '../../../../tests/utils/normalizeSnapshot';
export { wait } from '../../../../tests/utils/wait';
