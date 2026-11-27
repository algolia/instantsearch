import { createProgram } from '../program';

describe('--help', () => {
  it('lists init, introspect, and agents-md', () => {
    const program = createProgram();
    const help = program.helpInformation();

    expect(help).toMatch(/\binit\b/);
    expect(help).toMatch(/\bintrospect\b/);
    expect(help).toMatch(/\bagents-md\b/);
  });

  it('is named after the package', () => {
    expect(createProgram().helpInformation()).toMatch(
      /^Usage: create-instantsearch-app\b/
    );
  });
});
