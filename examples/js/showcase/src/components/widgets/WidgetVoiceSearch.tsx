import { voiceSearch } from "instantsearch.js/es/widgets";
import { useWidget } from "../../hooks/useWidget";

export function WidgetVoiceSearch() {
  const ref = useWidget((el) => voiceSearch({ container: el }));
  return <div ref={ref} />;
}
