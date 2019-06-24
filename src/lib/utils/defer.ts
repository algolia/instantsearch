const nextMicroTask = Promise.resolve();

type Callback = (...args: any[]) => void;

const defer = (callback: Callback): Callback => {
  let progress: Promise<void> | null = null;
  return (...args) => {
    if (progress !== null) {
      return;
    }

    progress = nextMicroTask.then(() => {
      callback(...args);
      progress = null;
    });
  };
};

export default defer;
