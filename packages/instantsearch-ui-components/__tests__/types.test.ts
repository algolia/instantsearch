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

  delintNode(sourceFile);

  function delintNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.FunctionDeclaration: {
        const functionDeclaration = node as ts.FunctionDeclaration;

        if (fileName === 'icons') {
          validateIcons(functionDeclaration, fileName, report(node));
        } else {
          validateComponents(functionDeclaration, fileName, report(node));
        }
        break;
      }
      default: {
        break;
      }
    }

    ts.forEachChild(node, delintNode);
  }

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

function validateIcons(
  functionDeclaration: ts.FunctionDeclaration,
  _filename: string,
  report: (message: string) => void
) {
  if (
    !(
      functionDeclaration.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
      ) &&
      functionDeclaration.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.DeclareKeyword
      )
    )
  ) {
    return;
  }

  const actualName = functionDeclaration.name?.getText();

  if (!actualName || !/^[A-Z].*Icon$/.test(actualName)) {
    report(
      `Icon function should start with a capital letter and end with 'Icon', but was '${actualName}' instead.`
    );
  }

  const parameters = functionDeclaration.parameters;
  if (parameters.length !== 1) {
    report(`Icon function should accept exactly one parameter.`);
  }

  const returnType = functionDeclaration.type;
  if (returnType && returnType.getText() !== 'JSX.Element') {
    report(
      `Icon function should return JSX.Element. (got '${returnType.getText()}')`
    );
  }
}

function validateComponents(
  functionDeclaration: ts.FunctionDeclaration,
  filename: string,
  report: (message: string) => void
) {
  const componentName = `create${filename}Component`;
  if (
    !(
      functionDeclaration.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
      ) &&
      functionDeclaration.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.DeclareKeyword
      )
    )
  ) {
    return;
  }

  const actualName = functionDeclaration.name?.getText();

  if (actualName?.startsWith('generate')) {
    // Allowed for generateSomething helper functions
    return;
  }

  if (actualName !== componentName) {
    report(
      `Exported component should be named '${componentName}', but was '${actualName}' instead.`
    );
  }

  const returnType = functionDeclaration.type as ts.FunctionTypeNode;

  if (returnType.kind !== ts.SyntaxKind.FunctionType) {
    report(`Exported component's return type should be a function.`);
  }

  if (
    returnType.kind === ts.SyntaxKind.FunctionType &&
    returnType.parameters.length > 1
  ) {
    report(
      `Exported component's return type should have zero or one parameter`
    );
  }

  if (
    functionDeclaration.type?.kind === ts.SyntaxKind.FunctionType &&
    (functionDeclaration.type as ts.FunctionTypeNode).parameters[0] &&
    (
      functionDeclaration.type as ts.FunctionTypeNode
    ).parameters[0].name.getText() !== 'userProps'
  ) {
    report(`Exported component's return type should be called 'userProps'.`);
  }
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
