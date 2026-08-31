import path from 'path';

import ts from 'typescript';

test('preserves custom message types in Chat text component props', () => {
  const fileName = path.join(__dirname, 'chat-text-component-generic.ts');
  const source = `
    import type { ChatProps } from '../dist/es';
    import type { ChatMessageProps } from 'instantsearch-ui-components';
    import type { UIMessage } from 'instantsearch.js/es/lib/chat';

    type AppMetadata = { sourceIds: string[] };
    type AppMessage = UIMessage<AppMetadata>;
    type MessagesProps = NonNullable<
      ChatProps<unknown, AppMessage>['messagesProps']
    >;
    type BaseMessagesProps = NonNullable<
      ChatProps<unknown>['messagesProps']
    >;
    type BaseRoleMessageProps = NonNullable<
      BaseMessagesProps['assistantMessageProps']
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

    const textComponent: NonNullable<
      NonNullable<MessagesProps['assistantMessageProps']>['textComponent']
    > = ({ message, messages }) => {
      if (message.metadata) {
        const metadata: AppMetadata = message.metadata;
        void metadata.sourceIds;
      }
      if (messages) {
        const conversation: AppMessage[] = messages;
        void conversation;
      }
      return null;
    };

    const messagesProps: MessagesProps = {
      assistantMessageProps: { textComponent },
      userMessageProps: { textComponent },
    };
    void messagesProps;

    const compatibleMessagesProps: MessagesProps = {
      assistantMessageProps: reusableMessageProps,
      userMessageProps: reusableRoleMessageProps,
    };
    void compatibleMessagesProps;

    const legacyMessagesProps: MessagesProps = {
      assistantMessageProps: legacyRoleMessageProps,
    };
    void legacyMessagesProps;

    const baseMessagesProps: NonNullable<
      ChatProps<unknown>['messagesProps']
    > = {
      assistantMessageProps: {
        textComponent({ message }) {
          void message;
          return null;
        },
      },
    };
    void baseMessagesProps;
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

test('accepts Chat text components without widget-owned callbacks', () => {
  const fileName = path.join(__dirname, 'chat-text-components.tsx');
  const source = `
    import { Chat } from '../dist/es';
    import type { UIMessage } from 'instantsearch.js/es/lib/chat';

    type AppMetadata = { sourceIds: string[] };
    type AppMessage = UIMessage<AppMetadata>;
    type AppHit = { objectID: string; __position: number };

    const chat = (
      <Chat<AppHit, AppMessage>
        agentId="agent"
        messagesProps={{
          assistantMessageProps: {
            textComponent({ part, message, messages }) {
              const metadata: AppMetadata | undefined = message.metadata;
              const conversation: AppMessage[] | undefined = messages;
              void metadata;
              void conversation;
              return <span>{part.text}</span>;
            },
          },
          userMessageProps: {
            textComponent({ part, message, messages }) {
              const metadata: AppMetadata | undefined = message.metadata;
              const conversation: AppMessage[] | undefined = messages;
              void metadata;
              void conversation;
              return <span>{part.text}</span>;
            },
          },
        }}
      />
    );
    void chat;
  `;
  const compilerOptions: ts.CompilerOptions = {
    jsx: ts.JsxEmit.ReactJSX,
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
