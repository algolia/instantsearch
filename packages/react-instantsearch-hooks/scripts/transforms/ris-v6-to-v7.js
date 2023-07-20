const elementName = (path) => path.value.openingElement.name.name;
const propName = (attribute) => attribute.node.name.name;
const parentElementName = (attribute) =>
  attribute.parentPath.parentPath.value.name.name;

const translations = {
  Breadcrumb: { rootLabel: 'rootElementText' },
  ClearRefinements: { reset: 'resetButtonText' },
  HierarchicalMenu: { showMore: 'showMoreButtonText' },
  Menu: { showMore: 'showMoreButtonText' },
  Pagination: {
    first: 'firstPageItemText',
    previous: 'previousPageItemText',
    next: 'nextPageItemText',
    last: 'lastPageItemText',
    page: 'pageItemText',
    ariaFirst: 'firstPageItemAriaLabel',
    ariaPrevious: 'previousPageItemAriaLabel',
    ariaNext: 'nextPageItemAriaLabel',
    ariaLast: 'lastPageItemAriaLabel',
    ariaPage: 'pageItemAriaLabel',
  },
  RangeInput: {
    submit: 'submitButtonText',
    separator: 'separatorElementText',
  },
  RefinementList: {
    noResults: 'noResultsText',
    submitTitle: 'submitButtonTitle',
    resetTitle: 'resetButtonTitle',
    showMore: 'showMoreButtonText',
  },
  SearchBox: {
    submitTitle: 'submitButtonTitle',
    resetTitle: 'resetButtonTitle',
  },
};

const componentsWithDefaultRefinement = [
  'HierarchicalMenu',
  'HitsPerPage',
  'Menu',
  'Pagination',
  'RangeInput',
  'RefinementList',
  'SearchBox',
  'SortBy',
  'ToggleRefinement',
];

export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const printOptions = options.printOptions || {
    quote: 'single',
    shouldAddParens: false,
  };
  const root = j(file.source);
  const jsxElements = root.findJSXElements();

  const replaceImports = (from, to) =>
    root
      .find(j.ImportDeclaration)
      .filter((path) => path.node.source.value === from)
      .forEach((sourceImport) =>
        j(sourceImport).replaceWith(
          j.importDeclaration(sourceImport.node.specifiers, j.stringLiteral(to))
        )
      );

  const replacePropName = ({ element, from, to }) =>
    jsxElements
      .filter((p) => elementName(p) === element)
      .find(j.JSXAttribute)
      .filter((attribute) => propName(attribute) === from)
      .forEach((attribute) =>
        j(attribute).replaceWith(
          j.jsxAttribute(j.jsxIdentifier(to), attribute.node.value)
        )
      );

  const replaceClearsQuery = () =>
    jsxElements
      .filter(
        (path) =>
          elementName(path) === 'ClearRefinements' ||
          elementName(path) === 'CurrentRefinements'
      )
      .find(j.JSXAttribute)
      .filter((attribute) => propName(attribute) === 'clearsQuery')
      .forEach((attribute) =>
        j(attribute).replaceWith(
          j.jsxAttribute(
            j.jsxIdentifier('excludedAttributes'),
            j.jsxExpressionContainer(j.template.expression`[]`)
          )
        )
      );

  const replaceTranslations = () =>
    jsxElements
      .filter((path) => Object.keys(translations).includes(elementName(path)))
      .find(j.JSXAttribute)
      .filter((attribute) => propName(attribute) === 'translations')
      .forEach((attribute) => {
        const translationsDict = translations[parentElementName(attribute)];

        if (j(attribute).find(j.ObjectExpression).size() === 0) {
          attribute.node.comments = [
            j.commentBlock(
              ` TODO: Follow the upgrade guide to rename the keys of the \`translations\` prop
See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/ `
            ),
          ];
          return;
        }

        j(attribute)
          .find(j.ObjectExpression)
          .find(j.Property)
          .forEach((property) => {
            const currentKey = property.value.key.name;
            const newKey = translationsDict[currentKey];
            const functionExpression = property.value.value;

            if (currentKey === 'showMore') {
              if (!functionExpression.params) {
                property.node.comments = [
                  j.commentBlock(
                    ` TODO: Rename this key to \`showMoreButton\` and change its function's first argument to an object with an \`isShowingMore\` key
See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/ `
                  ),
                ];
                return;
              }
              if (functionExpression.params.length > 0) {
                functionExpression.params = [
                  j.template
                    .expression`{ isShowingMore: ${functionExpression.params[0]} }`,
                ];
              }
            } else if (currentKey === 'page' || currentKey === 'ariaPage') {
              if (!functionExpression.params) {
                property.node.comments = [
                  j.commentBlock(
                    ` TODO: Rename this key and change its function's first argument to an object with a \`currentPage\` key
See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/ `
                  ),
                ];
                return;
              }
              if (functionExpression.params.length > 0) {
                functionExpression.params = [
                  j.template
                    .expression`{ currentPage: ${functionExpression.params[0]} }`,
                ];
              }
            } else if (currentKey === 'placeholder') {
              const jsxElement = attribute.parentPath.parentPath.value;
              const jsxElementName = jsxElement.name.name;
              const newProp =
                jsxElementName === 'SearchBox'
                  ? 'placeholder'
                  : 'searchablePlaceholder';
              const placeholder = property.value.value;

              if (placeholder.type !== 'Literal') {
                property.node.comments = [
                  j.commentLine(
                    ` TODO: Move this as a \`${newProp}\` prop for \`${jsxElementName}\``
                  ),
                ];
                return;
              }

              jsxElement.attributes = [
                ...jsxElement.attributes,
                j.jsxAttribute(j.jsxIdentifier(newProp), placeholder),
              ];

              property.prune();

              return;
            }

            if (newKey) {
              property.value.key.name = newKey;
            }
          });
      });

  const handleDefaultRefinements = () => {
    jsxElements
      .filter((path) =>
        componentsWithDefaultRefinement.includes(elementName(path))
      )
      .find(j.JSXAttribute)
      .filter((attribute) => propName(attribute) === 'defaultRefinement')
      .forEach((attribute) => {
        if (attribute.parentPath.parentPath.value.name.name === 'HitsPerPage') {
          attribute.node.comments = [
            j.commentLine(
              ' TODO: Remove this `defaultRefinement` prop and add `default: true` to the corresponding item in the `items` array prop.'
            ),
          ];
          return;
        }

        attribute.node.comments = [
          j.commentBlock(` TODO: Move this into \`InstantSearch\`'s \`initialUiState\` prop.
See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#default-refinements `),
        ];
      });
  };

  const commentProp = ({ element, prop, comment }) =>
    jsxElements
      .filter((p) => elementName(p) === element)
      .find(j.JSXAttribute)
      .filter((path) => propName(path) === prop)
      .forEach((path) => {
        path.node.comments = [j.commentBlock(` TODO: ${comment} `)];
      });

  replaceImports('react-instantsearch-dom', 'react-instantsearch');

  replacePropName({ element: 'Breadcrumb', from: 'rootURL', to: 'rootPath' });
  replacePropName({ element: 'ToggleRefinement', from: 'value', to: 'on' });

  replaceClearsQuery();
  replaceTranslations();
  handleDefaultRefinements();

  commentProp({
    element: 'InstantSearch',
    prop: 'searchState',
    comment: `\`searchState\` is no longer supported. This is now handled via an \`onStateChange\` callback.
See https://www.algolia.com/doc/api-reference/widgets/instantsearch/react/#widget-param-onstatechange`,
  });
  commentProp({
    element: 'InstantSearch',
    prop: 'resultsState',
    comment: `\`resultsState\` is no longer supported, if you used it for server-side rendering, you can follow
this guide : https://www.algolia.com/doc/guides/building-search-ui/going-further/server-side-rendering/react/`,
  });
  commentProp({
    element: 'InstantSearch',
    prop: 'createURL',
    comment: `\`createURL\` is not supported anymore, you can set \`routing\` to \`true\` or follow
this guide to implement routing : https://www.algolia.com/doc/guides/building-search-ui/going-further/routing-urls/react/`,
  });
  commentProp({
    element: 'InstantSearch',
    prop: 'onSearchStateChange',
    comment: `\`onSearchStateChange\` is no longer supported. This is now handled via an \`onStateChange\` callback.
See https://www.algolia.com/doc/api-reference/widgets/instantsearch/react/#widget-param-onstatechange`,
  });

  commentProp({
    element: 'RefinementList',
    prop: 'facetOrdering',
    comment: `\`facetOrdering\` is not supported anymore, see the new \`sortBy\` prop
there :https://www.algolia.com/doc/api-reference/widgets/refinement-list/react/#widget-param-sortby`,
  });

  return root.toSource(printOptions);
}
