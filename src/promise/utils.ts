export const isPromise = (value: any) =>
  ((typeof value === 'object' && value !== null) || typeof value === 'function') && typeof value.then === 'function';
