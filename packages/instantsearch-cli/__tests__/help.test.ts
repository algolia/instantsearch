import { createProgram } from '../src/program';

describe('--help', () => {
  it('lists init, add, and introspect commands', () => {
    const program = createProgram();
    const help = program.helpInformation();

    expect(help).toMatch(/\binit\b/);
    expect(help).toMatch(/\badd\b/);
    expect(help).toMatch(/\bintrospect\b/);
  });
});
