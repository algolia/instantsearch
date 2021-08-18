import { AnswersComponentTemplates } from '../../components/Answers/Answers';

const defaultTemplates: AnswersComponentTemplates = {
  header: '',
  loader: '',
  item: (item) => JSON.stringify(item),
};

export default defaultTemplates;
