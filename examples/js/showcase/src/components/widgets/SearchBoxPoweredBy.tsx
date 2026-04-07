import { searchBox, poweredBy } from "instantsearch.js/es/widgets";
import { useWidget } from "../../hooks/useWidget";

export function SearchBoxPoweredBy() {
  const searchBoxRef = useWidget((el) =>
    searchBox({ container: el, placeholder: "Search for products..." }),
  );
  const poweredByRef = useWidget((el) => poweredBy({ container: el }));

  return (
    <div class="relative flex items-center">
      <div ref={searchBoxRef} class="grow" />
      <div ref={poweredByRef} class="absolute right-3 origin-right scale-75" />
    </div>
  );
}
