import { CreatePlaceholder } from './index';

const createNoopPlaceholder: CreatePlaceholder = () => {
  const placeholder = ({ uiState }) => {
    console.log('noop', uiState);
  };

  placeholder.renderOptions = () => {
    return {
      routing: {
        createURL() {
          return '#';
        },
      },
    };
  };

  return placeholder;
};

export default createNoopPlaceholder;
