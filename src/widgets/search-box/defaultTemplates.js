/* eslint max-len: 0 */

export default {
  poweredBy: `
<div class="{{cssClasses.root}}">
  Search by
  <a class="{{cssClasses.link}}" href="{{url}}" target="_blank">Algolia</a>
</div>`,
  reset: `
<button type="reset" title="Clear the search query." class="{{cssClasses.root}}">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20" width="100%"
    height="100%"
  >
    <path
      d="M8.114 10L.944 2.83 0 1.885 1.886 0l.943.943L10 8.113l7.17-7.17.944-.943L20 1.886l-.943.943-7.17 7.17 7.17 7.17.943.944L18.114 20l-.943-.943-7.17-7.17-7.17 7.17-.944.943L0 18.114l.943-.943L8.113 10z"
      fill-rule="evenodd">
    </path>
  </svg>
</button>
  `,
  magnifier: `
<div class="{{cssClasses.root}}">
  <svg
    xmlns="http://www.w3.org/2000/svg" id="sbx-icon-search-13"
    viewBox="0 0 40 40"
    width="100%"
    height="100%"
  >
    <path
      d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z"
      fill-rule="evenodd">
    </path>
  </svg>
</div>
  `,
  loadingIndicator: `
<div class="{{cssClasses.root}}">
<!-- By Sam Herbert (@sherb), for everyone. More @ http://goo.gl/7AJzbL -->
<svg width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#BFC7D8">
    <g fill="none" fill-rule="evenodd">
        <g transform="translate(1 1)" stroke-width="2">
            <circle stroke-opacity=".5" cx="18" cy="18" r="18"/>
            <path d="M36 18c0-9.94-8.06-18-18-18">
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 18 18"
                    to="360 18 18"
                    dur="1s"
                    repeatCount="indefinite"/>
            </path>
        </g>
    </g>
</svg>
</div>
  `,
};
