import fs from 'fs';
import path from 'path';

import ts from 'typescript';

/**
 * Simple linting using the TypeScript compiler API.
 */
function delint(sourceFile: ts.SourceFile) {
  const errors: Array<{
    file: string;
    line: number;
    character: number;
    message: string;
  }> = [];
  const fileName = sourceFile.fileName.replace('.d.ts', '');

  if (fileName === 'icons') {
    validateIcons(sourceFile, report);
  } else {
    validateComponents(sourceFile, fileName, report);
  }

  validateComponentPropsUsage(sourceFile, report);

  function report(node: ts.Node) {
    return (message: string) => {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(
        node.getStart()
      );
      errors.push({
        file: sourceFile.fileName,
        line: line + 1,
        character: character + 1,
        message,
      });
    };
  }

  return errors;
}

function validateComponentPropsUsage(
  sourceFile: ts.SourceFile,
  report: (node: ts.Node) => (message: string) => void
) {
  function containsComponentProps(node: ts.Node): boolean {
    let found = false;
    function visit(n: ts.Node) {
      if (found) return;
      if (ts.isTypeReferenceNode(n)) {
        const tn = n.typeName;
        if (ts.isIdentifier(tn) && tn.text === 'ComponentProps') {
          found = true;
          return;
        }
      }
      ts.forEachChild(n, visit);
    }
    visit(node);
    return found;
  }

  function checkNode(node: ts.Node) {
    // Partial<ComponentProps<...>> or Pick<ComponentProps<...>, ...> are disallowed
    if (ts.isTypeReferenceNode(node)) {
      const tn = node.typeName;
      if (
        ts.isIdentifier(tn) &&
        ['Omit', 'Array'].includes(tn.text) === false
      ) {
        const args = node.typeArguments || [];
        for (const arg of args) {
          if (containsComponentProps(arg)) {
            report(node)(`${tn.text} should not be used with ComponentProps.`);
          }
        }
      }
    }

    // Indexed access: ComponentProps<'div'>['classNames']
    if (ts.isIndexedAccessTypeNode(node)) {
      const objectType = node.objectType;
      if (containsComponentProps(objectType)) {
        report(node)(`Indexed access on ComponentProps is disallowed.`);
      }
    }

    ts.forEachChild(node, checkNode);
  }

  checkNode(sourceFile);
}

function validateIcons(
  sourceFile: ts.SourceFile,
  report: (node: ts.Node) => (message: string) => void
) {
  function checkExportedFunction(functionDeclaration: ts.FunctionDeclaration) {
    const actualName = functionDeclaration.name?.getText();

    if (!actualName || !/^[A-Z].*Icon$/.test(actualName)) {
      report(functionDeclaration)(
        `Icon function should start with a capital letter and end with 'Icon', but was '${actualName}' instead.`
      );
    }

    const parameters = functionDeclaration.parameters;
    if (parameters.length !== 1) {
      report(functionDeclaration)(
        `Icon function should accept exactly one parameter.`
      );
    }

    const returnType = functionDeclaration.type;
    if (returnType && returnType.getText() !== 'JSX.Element') {
      report(functionDeclaration)(
        `Icon function should return JSX.Element. (got '${returnType.getText()}')`
      );
    }
  }

  function visit(node: ts.Node) {
    if (
      ts.isFunctionDeclaration(node) &&
      node.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
      ) &&
      node.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.DeclareKeyword
      )
    ) {
      checkExportedFunction(node);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

/**
 * The function a factory returns, seen through the wrappers TypeScript emits
 * around it. A factory that hands its host a helper —
 * `Object.assign(Component, { restore })` — declares a component that is also
 * an object, which comes out as an intersection whose members include the
 * function type. That is still a component: only the function member carries
 * the props contract these checks care about.
 */
function resolveComponentType(
  node: ts.TypeNode | undefined
): ts.FunctionTypeNode | undefined {
  if (!node) {
    return undefined;
  }
  if (ts.isFunctionTypeNode(node)) {
    return node;
  }
  if (ts.isParenthesizedTypeNode(node)) {
    return resolveComponentType(node.type);
  }
  if (ts.isIntersectionTypeNode(node)) {
    for (const member of node.types) {
      const componentType = resolveComponentType(member);
      if (componentType) {
        return componentType;
      }
    }
  }
  return undefined;
}

function validateComponents(
  sourceFile: ts.SourceFile,
  filename: string,
  report: (node: ts.Node) => (message: string) => void
) {
  const componentName = `create${filename}Component`;

  function checkExportedFunction(functionDeclaration: ts.FunctionDeclaration) {
    const actualName = functionDeclaration.name?.getText();

    if (actualName?.startsWith('generate')) {
      // Allowed for generateSomething helper functions
      return;
    }

    if (actualName !== componentName) {
      report(functionDeclaration)(
        `Exported component should be named '${componentName}', but was '${actualName}' instead.`
      );
    }

    const returnType = resolveComponentType(functionDeclaration.type);

    if (!returnType) {
      report(functionDeclaration)(
        `Exported component's return type should be a function.`
      );
    }

    if (returnType && returnType.parameters.length > 1) {
      report(functionDeclaration)(
        `Exported component's return type should have zero or one parameter`
      );
    }

    if (
      returnType &&
      returnType.parameters[0] &&
      returnType.parameters[0].name.getText() !== 'userProps'
    ) {
      report(functionDeclaration)(
        `Exported component's return type should be called 'userProps'.`
      );
    }
  }

  function visit(node: ts.Node) {
    if (
      ts.isFunctionDeclaration(node) &&
      node.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
      ) &&
      node.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.DeclareKeyword
      )
    ) {
      checkExportedFunction(node);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

const componentsDir = path.join(__dirname, '../dist/es/components');
const files: Array<{ file: string; subdir: string }> = [];

function walkDir(dir: string, relativePath: string = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullRelativePath = relativePath
      ? path.join(relativePath, entry.name)
      : entry.name;

    if (entry.isDirectory()) {
      walkDir(path.join(dir, entry.name), fullRelativePath);
    } else if (
      entry.name.endsWith('.d.ts') &&
      // Barrel files
      !entry.name.startsWith('index') &&
      // Helper files (not components)
      !entry.name.startsWith('create')
    ) {
      const subdir = path.dirname(fullRelativePath);
      files.push({ file: entry.name, subdir: subdir === '.' ? '' : subdir });
    }
  }
}

walkDir(componentsDir);

describe('the component type contract', () => {
  // The checks above run against built declarations, which can't express every
  // shape worth pinning down, and `resolveComponentType` is exactly the kind of
  // rule that rots quietly if nothing says where it stops. These declarations
  // stand in for emitted ones, under the file name `Hits.d.ts` so the expected
  // factory name is `createHitsComponent`.
  function messages(returnType: string): string[] {
    const sourceFile = ts.createSourceFile(
      'Hits.d.ts',
      `export declare function createHitsComponent(renderer: Renderer): ${returnType};`,
      ts.ScriptTarget.ES2015,
      true
    );

    return delint(sourceFile).map((error) => error.message);
  }

  test('accepts a factory returning a component', () => {
    expect(messages('(userProps: HitsProps) => JSX.Element')).toEqual([]);
  });

  test('accepts a factory that hands its host a helper', () => {
    // What `Object.assign(Component, { restore })` emits.
    expect(
      messages(
        '((userProps: HitsProps) => JSX.Element) & { restore: () => void }'
      )
    ).toEqual([]);
  });

  test('rejects a return type that is not a component', () => {
    expect(
      messages('{ Component: (userProps: HitsProps) => JSX.Element }')
    ).toEqual([`Exported component's return type should be a function.`]);
  });

  test('still checks the props argument inside a component with helpers', () => {
    expect(messages('(props: HitsProps) => JSX.Element')).toEqual([
      `Exported component's return type should be called 'userProps'.`,
    ]);
  });
});

describe('Exposes correct types', () => {
  describe.each(files)('$subdir/$file', ({ file, subdir }) => {
    it('has no errors', () => {
      const setParentNodes = true;
      const filePath = path.join(componentsDir, subdir, file);
      const sourceFile = ts.createSourceFile(
        file,
        fs.readFileSync(filePath).toString(),
        ts.ScriptTarget.ES2015,
        setParentNodes
      );

      expect(delint(sourceFile)).toEqual([]);
    });
  });
});

test('exposes Chat text component types from the public entry point', () => {
  const fileName = path.join(__dirname, 'chat-message-text-component.ts');
  const source = `
    import type { ChatStatus, TextUIPart } from 'instantsearch-core';
import type { ChatMessageBase } from 'instantsearch-core/internal';
    import type {
      ChatMessageProps,
      ChatMessageTextComponentProps,
    } from '../dist/es';

    const textComponent: ChatMessageProps['textComponent'] = (props) => {
      const part: TextUIPart = props.part;
      const message: ChatMessageBase = props.message;
      const messages: ChatMessageBase[] | undefined = props.messages;
      const status: ChatStatus = props.status;
      const partIndex: number = props.partIndex;
      const context: ChatMessageTextComponentProps = props;
      void part;
      void message;
      void messages;
      void status;
      void partIndex;
      void context;
      return null;
    };
    void textComponent;
  `;
  const compilerOptions: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    noEmit: true,
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ES2020,
  };
  const host = ts.createCompilerHost(compilerOptions);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (sourceName, languageVersion, onError) =>
    sourceName === fileName
      ? ts.createSourceFile(fileName, source, languageVersion, true)
      : getSourceFile(sourceName, languageVersion, onError);

  const program = ts.createProgram([fileName], compilerOptions, host);
  const errors = ts
    .getPreEmitDiagnostics(program)
    .map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    );

  expect(errors).toEqual([]);
});

test('exposes Chat reasoning component types from the public entry point', () => {
  const fileName = path.join(__dirname, 'chat-message-reasoning-component.ts');
  const source = `
    import type { ChatComponentContext, ReasoningUIPart } from 'instantsearch-core';
import type { ChatMessageBase } from 'instantsearch-core/internal';
    import type {
      ChatMessageProps,
      ChatMessageReasoningComponentProps,
      ChatMessageReasoningPart,
    } from '../dist/es';

    const reasoningComponent: ChatMessageProps['reasoningComponent'] = (props) => {
      const part: ReasoningUIPart = props.part;
      const partIndex: number = props.partIndex;
      const isStreaming: boolean = props.isStreaming;
      const message: ChatMessageBase = props.message;
      const context: ChatComponentContext = props.context;
      const exactProps: ChatMessageReasoningComponentProps = props;
      const receivedPart: ChatMessageReasoningPart = {
        part,
        partIndex,
        isStreaming,
      };
      void receivedPart;
      void part;
      void partIndex;
      void isStreaming;
      void message;
      void context;
      void exactProps;
      return null;
    };
    void reasoningComponent;
  `;
  const compilerOptions: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    noEmit: true,
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ES2020,
  };
  const host = ts.createCompilerHost(compilerOptions);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (sourceName, languageVersion, onError) =>
    sourceName === fileName
      ? ts.createSourceFile(fileName, source, languageVersion, true)
      : getSourceFile(sourceName, languageVersion, onError);

  const program = ts.createProgram([fileName], compilerOptions, host);
  const errors = ts
    .getPreEmitDiagnostics(program)
    .map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    );

  expect(errors).toEqual([]);
});

test('preserves custom message types in Chat text component props', () => {
  const fileName = path.join(
    __dirname,
    'chat-message-text-component-generic.ts'
  );
  const source = `
    import type { UIMessage } from 'instantsearch-core';
    import type {
      ChatMessageProps,
      ChatMessagesProps,
    } from '../dist/es';

    type AppMetadata = { sourceIds: string[] };
    type AppMessage = UIMessage<AppMetadata>;
    type BaseRoleMessageProps = NonNullable<
      ChatMessagesProps['assistantMessageProps']
    >;

    const reusableRoleMessageProps: BaseRoleMessageProps = {
      parseMarkdown: false,
    };
    const baseMessage = {
      role: 'assistant' as const,
      id: 'base',
      parts: [],
    };
    const legacyRoleMessageProps: BaseRoleMessageProps = {
      message: baseMessage,
      messages: [baseMessage],
    };
    const reusableMessageProps: Partial<
      Omit<ChatMessageProps, 'ref' | 'key'>
    > = {
      parseMarkdown: false,
    };

    const assistantMessageProps: NonNullable<
      ChatMessagesProps<AppMessage>['assistantMessageProps']
    > = {
      textComponent({ message, messages }) {
        if (message.metadata) {
          const metadata: AppMetadata = message.metadata;
          void metadata.sourceIds;
        }
        if (messages) {
          const conversation: AppMessage[] = messages;
          void conversation;
        }
        return null;
      },
      reasoningComponent({ part, partIndex, message, context }) {
        const typedMessage: AppMessage = message;
        const typedConversation: AppMessage[] = context.messages;
        const typedIndex: number = partIndex;
        void typedMessage.metadata?.sourceIds;
        void typedConversation;
        void part.text;
        void typedIndex;
        return null;
      },
    };
    void assistantMessageProps;

    const messagesProps: ChatMessagesProps<AppMessage> = {
      messages: [],
      indexUiState: {},
      setIndexUiState() {},
      tools: {},
      onReload() {},
      onClose() {},
      assistantMessageProps: reusableMessageProps,
      userMessageProps: reusableRoleMessageProps,
    };
    void messagesProps;

    const legacyMessagesProps: ChatMessagesProps<AppMessage> = {
      ...messagesProps,
      assistantMessageProps: legacyRoleMessageProps,
    };
    void legacyMessagesProps;
  `;
  const compilerOptions: ts.CompilerOptions = {
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    noEmit: true,
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ES2020,
  };
  const host = ts.createCompilerHost(compilerOptions);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (sourceName, languageVersion, onError) =>
    sourceName === fileName
      ? ts.createSourceFile(fileName, source, languageVersion, true)
      : getSourceFile(sourceName, languageVersion, onError);

  const program = ts.createProgram([fileName], compilerOptions, host);
  const errors = ts
    .getPreEmitDiagnostics(program)
    .map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    );

  expect(errors).toEqual([]);
});
