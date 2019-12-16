type StoryFn = (storyFnParameter: {
  container: HTMLElement;
  instantsearch: any;
  search: any;
}) => void;

export const withInsights = (storyFn: StoryFn): StoryFn => (
  ...storyFnParameters
) => {
  if (!(window as any).aa) {
    // inject snippet
    const script = document.createElement('script');
    script.innerHTML = `
var ALGOLIA_INSIGHTS_SRC = "https://cdn.jsdelivr.net/npm/search-insights@latest";

!function(e,a,t,n,s,i,c){e.AlgoliaAnalyticsObject=s,e.aa=e.aa||function(){
(e.aa.queue=e.aa.queue||[]).push(arguments)},i=a.createElement(t),c=a.getElementsByTagName(t)[0],
i.async=1,i.src=ALGOLIA_INSIGHTS_SRC,c.parentNode.insertBefore(i,c)
}(window,document,"script",0,"aa");
`;
    document.head.appendChild(script);
  }

  const [{ instantsearch }] = storyFnParameters;

  instantsearch.insightsClient = (window as any).aa;

  storyFn(...storyFnParameters);
};
