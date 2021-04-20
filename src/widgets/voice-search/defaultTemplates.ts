import { VoiceSearchTemplates } from './voice-search';

const getButtonInnerElement = (
  status: string,
  errorCode: string,
  isListening: boolean
) => {
  if (status === 'error' && errorCode === 'not-allowed') {
    return `<line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>`;
  }
  return `<path
            d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
            fill="${isListening ? 'currentColor' : 'none'}">
          </path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>`;
};

const defaultTemplates: VoiceSearchTemplates = {
  buttonText({ status, errorCode, isListening }) {
    return `<svg
       xmlns="http://www.w3.org/2000/svg"
       width="16"
       height="16"
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       stroke-width="2"
       stroke-linecap="round"
       stroke-linejoin="round"
     >
       ${getButtonInnerElement(status, errorCode, isListening)}
     </svg>`;
  },
  status: `<p>{{transcript}}</p>`,
};

export default defaultTemplates;
