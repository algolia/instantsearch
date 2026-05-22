import { chatTrigger } from "instantsearch.js/es/widgets";

import { useWidget } from "../../hooks/useWidget";
import { postToParent } from "../../utils/parentMessenger";

const IS_EMBEDDED =
  typeof window !== "undefined" && window.parent !== window;

export function WidgetChatTrigger() {
  const ref = useWidget((el) =>
    chatTrigger({ container: el, floating: false }),
  );

  // When embedded, opening the chat needs to ask the parent docs to scroll
  // the showcase into view, since the overlay/sidePanel panel would otherwise
  // appear far below the user's viewport. The trigger's own click handler
  // runs inside the widget, so we listen for the bubbled event here.
  const onWrapperClick = () => {
    if (IS_EMBEDDED) {
      postToParent({ type: "showcase-scroll-into-view" });
    }
  };

  return (
    <div onClick={onWrapperClick}>
      <div ref={ref} />
    </div>
  );
}
