import { createProgram } from '../src/program';

const silentIO = {
  stdout: () => undefined,
  stderr: () => undefined,
};

describe('global options', () => {
  describe('--json implies --yes', () => {
    it('sets yes=true when --json is passed', async () => {
      const program = createProgram(silentIO);
      await program.parseAsync(['add', '--json'], { from: 'user' });

      expect(program.opts()).toMatchObject({ json: true, yes: true });
    });
  });

  describe('--yes', () => {
    it('is a standalone global flag (yes=true, json=false)', async () => {
      const program = createProgram(silentIO);
      await program.parseAsync(['add', '--yes'], { from: 'user' });

      expect(program.opts()).toMatchObject({ json: false, yes: true });
    });

    it('defaults to false when neither --yes nor --json is passed', async () => {
      const program = createProgram(silentIO);
      await program.parseAsync(['add'], { from: 'user' });

      expect(program.opts()).toMatchObject({ json: false, yes: false });
    });
  });
});
