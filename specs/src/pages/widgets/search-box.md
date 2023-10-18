---
layout: ../../layouts/WidgetLayout.astro
title: SearchBox
type: widget
html: |
  <div class="ais-SearchBox">
    <form class="ais-SearchBox-form" novalidate>
      <input class="ais-SearchBox-input" autocomplete="off" autocorrect="off" autocapitalize="off" placeholder="Search for products" spellcheck="false" maxlength="512" type="search" value="" aria-label="Search" />
      <button class="ais-SearchBox-submit" type="submit" title="Submit the search query.">
        <svg class="ais-SearchBox-submitIcon" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"></path>
        </svg>
      </button>
      <button class="ais-SearchBox-reset" type="reset" title="Clear the search query." hidden>
        <svg class="ais-SearchBox-resetIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="10" height="10" aria-hidden="true">
          <path d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"></path>
        </svg>
      </button>
      <span class="ais-SearchBox-loadingIndicator" hidden>
        <svg width="16" height="16" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#444" class="ais-SearchBox-loadingIcon" aria-hidden="true">
          <g fill="none" fillRule="evenodd">
            <g transform="translate(1 1)" strokeWidth="2">
              <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
              <path d="M36 18c0-9.94-8.06-18-18-18">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 18"
                  to="360 18 18"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </g>
        </svg>
      </span>
    </form>
  </div>
alt1: Text is being typed
althtml1: |
  <div class="ais-SearchBox">
    <form class="ais-SearchBox-form" novalidate>
      <input class="ais-SearchBox-input" autocomplete="off" autocorrect="off" autocapitalize="off" placeholder="Search for products" spellcheck="false" maxlength="512" type="search" value="Typing text..." />
      <button class="ais-SearchBox-submit" type="submit" title="Submit the search query.">
        <svg class="ais-SearchBox-submitIcon" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"></path>
        </svg>
      </button>
      <button class="ais-SearchBox-reset" type="reset" title="Clear the search query.">
        <svg class="ais-SearchBox-resetIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="10" height="10" aria-hidden="true">
          <path d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"></path>
        </svg>
      </button>
      <span class="ais-SearchBox-loadingIndicator" hidden>
        <svg width="16" height="16" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#444" class="ais-SearchBox-loadingIcon" aria-hidden="true">
          <g fill="none" fillRule="evenodd">
            <g transform="translate(1 1)" strokeWidth="2">
              <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
              <path d="M36 18c0-9.94-8.06-18-18-18">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 18"
                  to="360 18 18"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </g>
        </svg>
      </span>
    </form>
  </div>
alt2: Showing the loading indicator
althtml2: |
  <div class="ais-SearchBox">
    <form class="ais-SearchBox-form" novalidate>
      <input class="ais-SearchBox-input" autocomplete="off" autocorrect="off" autocapitalize="off" placeholder="Search for products" spellcheck="false" maxlength="512" type="search" value="Typing text..." />
      <button class="ais-SearchBox-submit" type="submit" title="Submit the search query.">
        <svg class="ais-SearchBox-submitIcon" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 40 40" aria-hidden="true">
          <path d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"></path>
        </svg>
      </button>
      <button class="ais-SearchBox-reset" type="reset" title="Clear the search query." hidden>
        <svg class="ais-SearchBox-resetIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="10" height="10" aria-hidden="true">
          <path d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"></path>
        </svg>
      </button>
      <span class="ais-SearchBox-loadingIndicator">
        <svg width="16" height="16" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#444" class="ais-SearchBox-loadingIcon" aria-hidden="true">
          <g fill="none" fillRule="evenodd">
            <g transform="translate(1 1)" strokeWidth="2">
              <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
              <path d="M36 18c0-9.94-8.06-18-18-18">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 18"
                  to="360 18 18"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </g>
        </svg>
      </span>
    </form>
  </div>
classes:
  - name: .ais-SearchBox
    description: the root div of the widget
  - name: .ais-SearchBox-form
    description: the wrapping form
  - name: .ais-SearchBox-input
    description: the search input
  - name: .ais-SearchBox-submit
    description: the submit button
  - name: .ais-SearchBox-submitIcon
    description: the magnifier icon used with the search input
  - name: .ais-SearchBox-reset
    description: the reset button used to clear the content of the input
  - name: .ais-SearchBox-resetIcon
    description: the reset icon used inside the reset button
options:
  - name: placeholder
    description: The placeholder of this input
  - name: searchAsYouType
    default: true
    description: Should we search on every change to the query? If you disable this option, new searches will only be triggered by clicking the search button or by pressing the enter key while the search box is focused.
  - name: submit
    default: search
    description: The accessible text for the 🔎
  - name: reset
    default: reset query
    description: The accessible text for the ❌
  - name: loading
    default: loading
    description: The accessible text for the 🔄
  - name: showLoadingIndicator
    default: false
    description: Define if a loading indicator should be added at beginning of the input to indicate that search is currently stalled.
  - name: autofocus
    default: false
    description: Focus on the input automatically
translations:
  - name: resetButtonTitle
    default: '"Clear the search query"'
    description: The submit button title of the search box.
  - name: submitButtonTitle
    default: '"Submit the search query"'
    description: The reset button title of the search box.
---
