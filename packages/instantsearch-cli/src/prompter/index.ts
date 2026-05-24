import inquirer from 'inquirer';

export type Choice<T extends string = string> = {
  name: string;
  value: T;
};

export interface Prompter {
  text(message: string, opts?: { default?: string }): Promise<string>;
  password(message: string): Promise<string>;
  confirm(message: string, opts?: { default?: boolean }): Promise<boolean>;
  select<T extends string>(message: string, choices: Choice<T>[]): Promise<T>;
  multiSelect<T extends string>(message: string, choices: Choice<T>[]): Promise<T[]>;
}

export function createInquirerPrompter(): Prompter {
  return {
    async text(message, opts) {
      const { value } = await inquirer.prompt<{ value: string }>([
        { type: 'input', name: 'value', message, default: opts?.default },
      ]);
      return value;
    },

    async password(message) {
      const { value } = await inquirer.prompt<{ value: string }>([
        { type: 'password', name: 'value', message, mask: '*' },
      ]);
      return value;
    },

    async confirm(message, opts) {
      const { value } = await inquirer.prompt<{ value: boolean }>([
        { type: 'confirm', name: 'value', message, default: opts?.default ?? true },
      ]);
      return value;
    },

    async select<T extends string>(message: string, choices: Choice<T>[]) {
      const { value } = await inquirer.prompt<{ value: T }>([
        { type: 'list', name: 'value', message, choices },
      ]);
      return value;
    },

    async multiSelect<T extends string>(message: string, choices: Choice<T>[]) {
      const { value } = await inquirer.prompt<{ value: T[] }>([
        { type: 'checkbox', name: 'value', message, choices },
      ]);
      return value;
    },
  };
}

export function createScriptedPrompter(
  answers: Array<string | boolean | string[]>
): Prompter {
  const queue = [...answers];
  function next(label: string): unknown {
    if (queue.length === 0) {
      throw new Error(`ScriptedPrompter ran out of answers (prompted for: "${label}")`);
    }
    return queue.shift();
  }
  return {
    async text(message) { return next(message) as string; },
    async password(message) { return next(message) as string; },
    async confirm(message) { return next(message) as boolean; },
    async select(message) { return next(message) as string; },
    async multiSelect(message) { return next(message) as string[]; },
  } as Prompter;
}
