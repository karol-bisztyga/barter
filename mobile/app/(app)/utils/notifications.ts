export const showInfo = (...args: Array<string | number | boolean>) => {
  console.log(...args);
};

export const showWarning = (...args: Array<string | number | boolean>) => {
  console.warn(...args);
};

export const showError = (...args: Array<string | number | boolean>) => {
  console.error(...args);
};
