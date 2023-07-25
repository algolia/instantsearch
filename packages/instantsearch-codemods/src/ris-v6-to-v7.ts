import type {
  API,
  FileInfo,
  Options,
  ASTPath,
  JSXElement,
  JSXIdentifier,
  JSXAttribute,
  Identifier,
  FunctionExpression,
  JSXExpressionContainer,
  CallExpression,
} from 'jscodeshift';

const elementName = (path: ASTPath<JSXElement>) =>
  (path.value.openingElement.name as JSXIdentifier).name;
const propName = (attribute: ASTPath<JSXAttribute>) =>
  attribute.node.name.name as string;
const parentElementName = (attribute: ASTPath<JSXAttribute>) =>
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

export default function transform(
  file: FileInfo,
  { jscodeshift: j }: API,
  options: Options
) {
  const printOptions = options.printOptions || {
    quote: 'single',
  };
  const root = j(file.source);
  const jsxElements = root.findJSXElements();

  const replaceImports = (from: string, to: string) =>
    root
      .find(j.ImportDeclaration)
      .filter(
        (path) =>
          path.node.source.value === from ||
          (typeof path.node.source.value === 'string' &&
            path.node.source.value.startsWith(`${from}/`))
      )
      .forEach((sourceImport) => {
        const value = sourceImport.value.source.value as string;
        j(sourceImport).replaceWith(
          j.importDeclaration(
            sourceImport.node.specifiers,
            j.stringLiteral(value.replace(from, to))
          )
        );
      });

  const replacePropName = ({
    element,
    from,
    to,
  }: {
    element: string;
    from: string;
    to: string;
  }) =>
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
        const translationsDict =
          translations[
            parentElementName(attribute) as keyof typeof translations
          ];

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
            const currentKey = (property.value.key as Identifier).name;
            const newKey =
              translationsDict[currentKey as keyof typeof translationsDict];
            const functionExpression = property.value
              .value as FunctionExpression;

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

              jsxElement.attributes = [
                ...jsxElement.attributes,
                j.jsxAttribute(
                  j.jsxIdentifier(newProp),
                  placeholder.type === 'Literal'
                    ? placeholder
                    : j.jsxExpressionContainer(placeholder as Identifier)
                ),
              ];

              property.prune();

              return;
            }

            if (newKey) {
              (property.value.key as Identifier).name = newKey;
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

  const handleMenuSelect = () => {
    const imports = root
      .find(j.ImportDeclaration)
      .filter((path) => path.node.source.value === 'react-instantsearch')
      .find(j.ImportSpecifier)
      .filter((path) => path.node.imported.name === 'MenuSelect');

    if (imports.size() === 0) {
      return;
    }

    imports.replaceWith(j.importSpecifier(j.identifier('useMenu')));

    root.get().node.program.body.push(j.template.statement`

function MenuSelect(props) {
  const { items, refine } = useMenu(props, {
    $$widgetType: 'custom.menuSelect',
  });

  return (
    <select onChange={(event) => refine(event.target.value)}>
      {items.map((item) => (
        <option key={item.label} value={item.value} selected={item.isRefined}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
    `);
  };

  /*
   * finds the highest parent of a path in the body, for example to add a top-level comment
   */
  const findParent = (path: ASTPath): ASTPath => {
    const parent = path.parentPath;

    if (parent.name === 'body') {
      return path;
    }

    return findParent(parent);
  };

  const handleCreateConnector = () => {
    const imports = root
      .find(j.ImportDeclaration)
      .filter((path) => path.node.source.value === 'react-instantsearch')
      .find(j.ImportSpecifier)
      .filter((path) => path.node.imported.name === 'createConnector');

    if (imports.size() === 0) {
      return;
    }

    imports.remove();

    root
      .find(j.CallExpression)
      .filter((path) => {
        return (path.node.callee as Identifier).name === 'createConnector';
      })
      .forEach((path) => {
        const parent = findParent(path) as ASTPath<Identifier>;

        parent.node.comments ??= [];
        parent.node.comments.push(
          j.commentBlock(`
 * TODO: custom widgets must be converted to hooks.
 * See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react/#creating-connectors
 `)
        );
      });
  };

  const handleConnectors = () => {
    const imports = root
      .find(j.ImportDeclaration)
      .filter((path) => path.node.source.value === 'react-instantsearch')
      .find(j.ImportSpecifier)
      .filter((path) => path.node.imported.name.startsWith('connect'));

    if (imports.size() === 0) {
      return;
    }

    imports.replaceWith((path) =>
      j.importSpecifier(
        j.identifier(path.node.imported.name.replace('connect', 'use'))
      )
    );

    imports.forEach((path) => {
      const connectorName = path.node.imported.name.split('use')[1];

      root.get().node.program.body.push(j.template.statement`

      // TODO: ensure your usage correctly maps the props from the connector to the hook
      function ${`connect${connectorName}`}(Component) {
        const ${connectorName} = (props) => {
          const data = ${`use${connectorName}`}(props);

          return <Component {...props} {...data} />;
        };

        return ${connectorName};
      }
      `);
    });
  };

  const handleSearchboxIcons = () => {
    const propsDict = {
      submit: 'submitIconComponent',
      reset: 'resetIconComponent',
      loadingIndicator: 'loadingIconComponent',
    };

    jsxElements
      .filter((path) => elementName(path) === 'SearchBox')
      .find(j.JSXAttribute)
      .filter((attribute) =>
        Object.keys(propsDict).includes(propName(attribute))
      )
      .forEach((attribute) => {
        const newProp =
          propsDict[propName(attribute) as keyof typeof propsDict];

        const container = attribute.value.value as JSXExpressionContainer;
        j(attribute).replaceWith(
          j.jsxAttribute(
            j.jsxIdentifier(newProp),
            j.jsxExpressionContainer(
              j.arrowFunctionExpression(
                [],
                container.expression as CallExpression
              )
            )
          )
        );
      });
  };

  const commentProp = ({
    element,
    prop,
    comment,
  }: {
    element: string;
    prop: string;
    comment: string;
  }) =>
    jsxElements
      .filter((p) => elementName(p) === element)
      .find(j.JSXAttribute)
      .filter((path) => propName(path) === prop)
      .forEach((path) => {
        path.node.comments = [j.commentBlock(` TODO: ${comment} `)];
      });

  replaceImports('react-instantsearch-dom', 'react-instantsearch');

  replacePropName({ element: 'Breadcrumb', from: 'rootURL', to: 'rootPath' });
  replacePropName({
    element: 'Highlight',
    from: 'tagName',
    to: 'highlightedTagName',
  });
  replacePropName({
    element: 'Snippet',
    from: 'tagName',
    to: 'highlightedTagName',
  });
  replacePropName({ element: 'ToggleRefinement', from: 'value', to: 'on' });

  replaceClearsQuery();
  replaceTranslations();
  handleDefaultRefinements();
  handleMenuSelect();
  handleCreateConnector();
  handleConnectors();
  handleSearchboxIcons();

  commentProp({
    element: 'InstantSearch',
    prop: 'searchState',
    comment: `\`searchState\` is no longer supported. This is now handled via an \`onStateChange\` callback.
See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-searchstate-with-initialuistate`,
  });
  commentProp({
    element: 'InstantSearch',
    prop: 'resultsState',
    comment: `\`resultsState\` is no longer supported, if you used it for server-side rendering, you can follow
this guide : https://www.algolia.com/doc/guides/building-search-ui/going-further/server-side-rendering/react/`,
  });
  commentProp({
    element: 'InstantSearch',
    prop: 'onSearchParameters',
    comment: `\`onSearchParameters\` is no longer supported, if you used it for server-side rendering, you can follow
this guide : https://www.algolia.com/doc/guides/building-search-ui/going-further/server-side-rendering/react/`,
  });
  commentProp({
    element: 'InstantSearch',
    prop: 'createURL',
    comment: `\`createURL\` should be moved to the \`routing\` prop.
See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#move-createurl-in-routing`,
  });
  commentProp({
    element: 'InstantSearch',
    prop: 'onSearchStateChange',
    comment: `\`onSearchStateChange\` is no longer supported. This is now handled via an \`onStateChange\` callback.
See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-onsearchstatechange-with-onstatechange`,
  });
  commentProp({
    element: 'InstantSearch',
    prop: 'refresh',
    comment: `the \`refresh\` prop is no longer a prop on \`InstantSearch\`. It can now be called programmatically via the \`refresh\` function returned by \`useInstantSearch\`.
See https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-refresh-prop-with-refresh-from-useinstantsearch`,
  });

  commentProp({
    element: 'HierarchicalMenu',
    prop: 'facetOrdering',
    comment: `\`facetOrdering\` is not supported anymore, see the new \`sortBy\` prop
there : https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-facetordering-with-sortby`,
  });
  commentProp({
    element: 'Menu',
    prop: 'facetOrdering',
    comment: `\`facetOrdering\` is not supported anymore, see the new \`sortBy\` prop
there : https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-facetordering-with-sortby`,
  });
  commentProp({
    element: 'RefinementList',
    prop: 'facetOrdering',
    comment: `\`facetOrdering\` is not supported anymore, see the new \`sortBy\` prop
there : https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-facetordering-with-sortby`,
  });

  commentProp({
    element: 'SearchBox',
    prop: 'focusShortcuts',
    comment: `\`focusShortcuts\` is not supported anymore, see there for suggestions on how to replace
it : https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/react-hooks/#replace-focusshortcuts-with-custom-code`,
  });

  return root.toSource(printOptions);
}
