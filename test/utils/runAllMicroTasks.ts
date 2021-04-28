/** await execution of all pending promises */
export const runAllMicroTasks = (): Promise<void> => new Promise(setImmediate);

/** await execution of all pending timeouts */
export const runAllMacroTasks = (ms = 0): Promise<void> =>
  new Promise(res => setTimeout(res, ms));
