import jsHelper from "algoliasearch-helper";
const SearchResults = jsHelper.SearchResults;

import connectBreadcrumb from "../connectBreadcrumb.js";

describe("connectBreadcrumb", () => {
  it("Renders during init and render", () => {
    // https://facebook.github.io/jest/docs/en/mock-function-api.html#mockfnmockcalls
    // Size of array + check parameters in array = TODO
  });

  it("Does not duplicate configuration", () => {
    const makeWidget = connectBreadcrumb(() => {});
    const widget = makeWidget({ attributes: ["category", "sub_category"] });

    const partialConfiguration = widget.getConfiguration({
      hierarchicalFacets: [
        {
          attributes: ["category", "sub_category"],
          name: "category",
          rootPath: null,
          separator: " > ",
          showParentLevel: true
        }
      ]
    });

    expect(partialConfiguration).toEqual({});
  });

  it("Provides a configuration if none exists", () => {
    const makeWidget = connectBreadcrumb(() => {});
    const widget = makeWidget({ attributes: ["category", "sub_category"] });

    const partialConfiguration = widget.getConfiguration({});

    expect(partialConfiguration).toEqual({
      hierarchicalFacets: [
        {
          attributes: ["category", "sub_category"],
          name: "category",
          separator: " > "
        }
      ]
    });
  });
  it("Provides an additional configuration if the existing one is different", () => {
    const makeWidget = connectBreadcrumb(() => {});
    const widget = makeWidget({ attributes: ["category", "sub_category"] });

    const partialConfiguration = widget.getConfiguration({
      hierarchicalFacets: [
        {
          attributes: ["otherCategory", "otherSub_category"],
          name: "otherCategory",
          separator: " > "
        }
      ]
    });

    expect(partialConfiguration).toEqual({
      hierarchicalFacets: [
        {
          attributes: ["category", "sub_category"],
          name: "category",
          separator: " > "
        }
      ]
    });
  });
});
