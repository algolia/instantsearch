---
title: VoiceSearch
type: widget
info: |
  The icon is from <a href="https://feathericons.com/" target="_blank">Feather icons</a>. Its license is MIT and the attribution is not needed according to <a href="https://github.com/feathericons/feather/issues/95" target="_blank">this</a>.
html: |
  <div class="ais-VoiceSearch">
    <button class="ais-VoiceSearch-button" type="button" title="Search by voice">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-mic">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    </button>
    <div class="ais-VoiceSearch-status">
      <p>Amazon Fire tablet</p>
    </div>
  </div>
alt1: Recognizing speech
althtml1: |
  <div class="ais-VoiceSearch">
    <button class="ais-VoiceSearch-button" type="button" title="Search by voice">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-mic">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    </button>
    <div class="ais-VoiceSearch-status">
      <p>Amazon Fire tablet</p>
    </div>
  </div>
alt2: Disabled on unsupported browser
althtml2: |
  <div class="ais-VoiceSearch">
    <button class="ais-VoiceSearch-button" type="button" title="Search by voice" disabled>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-mic">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    </button>
    <div class="ais-VoiceSearch-status">
      <p></p>
    </div>
  </div>
classes:
  - name: .ais-VoiceSearch
    description: the root div of the widget
  - name: .ais-VoiceSearch-button
    description: the button to trigger the voice search
  - name: .ais-VoiceSearch-status
    description: the status of the voice search
options:
  - name: searchAsYouSpeak
    default: false
    description: If you enable this option, new searches will be triggered every time speech recognition generates interim transcript while speaking.
---
