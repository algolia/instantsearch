import { connectVoiceSearch } from 'react-instantsearch-core';

import VoiceSearch from '../components/VoiceSearch';

export default connectVoiceSearch(VoiceSearch, {
  $$widgetType: 'ais.voiceSearch',
});
