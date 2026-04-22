/** @jsx h */

import { h, Fragment } from 'preact';

import type { AnswersComponentTemplates } from '../../components/Answers/Answers';

const defaultTemplates: AnswersComponentTemplates = {
  header() {
    return '';
  },
  loader() {
    return '';
  },
  item(item) {
    return <Fragment>{JSON.stringify(item)}</Fragment>;
  },
};

export default defaultTemplates;
