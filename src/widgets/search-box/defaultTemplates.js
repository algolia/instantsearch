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
};
