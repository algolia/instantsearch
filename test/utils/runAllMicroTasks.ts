export const runAllMicroTasks = (): Promise<void> => new Promise(setImmediate);
