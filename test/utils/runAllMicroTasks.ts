/** await execution of all pending promises */
export const runAllMicroTasks = (): Promise<void> => new Promise(setImmediate);
