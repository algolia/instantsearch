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

    const returnType = functionDeclaration.type as ts.FunctionTypeNode;

    if (returnType.kind !== ts.SyntaxKind.FunctionType) {
      report(functionDeclaration)(
        `Exported component's return type should be a function.`
      );
    }

    if (
      returnType.kind === ts.SyntaxKind.FunctionType &&
      returnType.parameters.length > 1
    ) {
      report(functionDeclaration)(
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
