import { configure } from "instantsearch.js/es/widgets";
import { useEffect } from "preact/hooks";

import { useSearch } from "../../context/search";

const searchParameters = {
  attributesToSnippet: ["description:10"],
  snippetEllipsisText: "[…]",
};

export function WidgetConfigure() {
  const search = useSearch();

  useEffect(() => {
    const widget = configure(searchParameters);
    search.addWidgets([widget]);
    return () => search.removeWidgets([widget]);
  }, []);

  return (
    <pre class="m-0 whitespace-pre-wrap break-all text-xs text-neutral-600 dark:text-neutral-400">
      {JSON.stringify(searchParameters, null, 2)}
    </pre>
  );
}
