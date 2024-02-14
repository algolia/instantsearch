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

  delintNode(sourceFile);

  function delintNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.FunctionDeclaration: {
        const functionDeclaration = node as ts.FunctionDeclaration;
        const fileNameSegment = sourceFile.fileName.replace('.d.ts', '');
        const componentName = `create${fileNameSegment}Component`;
        if (
          functionDeclaration.modifiers?.some(
            (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
          ) &&
          functionDeclaration.modifiers?.some(
            (modifier) => modifier.kind === ts.SyntaxKind.DeclareKeyword
          )
        ) {
          const actualName = functionDeclaration.name?.getText();
          if (actualName !== componentName) {
            report(
              node,
              `Exported component should be named '${componentName}', but was '${actualName}' instead.`
            );
          }

          const returnType = functionDeclaration.type as ts.FunctionTypeNode;

          if (returnType.kind !== ts.SyntaxKind.FunctionType) {
            report(
              node,
              `Exported component's return type should be a function.`
            );
          }

          if (
            returnType.kind === ts.SyntaxKind.FunctionType &&
            returnType.parameters.length !== 1
          ) {
            report(
              node,
              `Exported component's return type should have exactly one parameter`
            );
          }

          if (
            functionDeclaration.type?.kind === ts.SyntaxKind.FunctionType &&
            (
              functionDeclaration.type as ts.FunctionTypeNode
            ).parameters[0].name.getText() !== 'userProps'
          ) {
            report(
              node,
              `Exported component's return type should be called 'userProps'.`
            );
          }
        }

        break;
      }
      default: {
        break;
      }
    }

    ts.forEachChild(node, delintNode);
  }

  function report(node: ts.Node, message: string) {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(
      node.getStart()
    );
    errors.push({
      file: sourceFile.fileName,
      line: line + 1,
      character: character + 1,
      message,
    });
  }

  return errors;
}

const files = fs
  .readdirSync(path.join(__dirname, '../dist/es/components'))
  .filter((file) => file.endsWith('.d.ts') && !file.startsWith('index'));

describe('Exposes correct types', () => {
  describe.each(files)('%s', (file) => {
    it('has no errors', () => {
      const setParentNodes = true;
      const sourceFile = ts.createSourceFile(
        file,
        fs
          .readFileSync(path.join(__dirname, '../dist/es/components', file))
          .toString(),
        ts.ScriptTarget.ES2015,
        setParentNodes
      );

      expect(delint(sourceFile)).toEqual([]);
    });
  });
});
