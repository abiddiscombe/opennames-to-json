// src/utilities.ts

export { status };

const status = {
  info: (content: string) => console.info(`[ INFO ] ${content}`),
  warn: (content: string) => console.warn(`[ WARN ] ${content}`),
  error: (content: string) => console.error(`[ FAIL ] ${content}`),
  other: (content: string) => console.info(`[ ---- ] ${content}`),
};
