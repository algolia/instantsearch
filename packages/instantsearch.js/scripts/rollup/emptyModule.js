// Placeholder export for 'zod' module
export const ZodFirstPartyTypeKind = {};
export const toJSONSchema = {};
export const safeParseAsync = {};
export const z = new Proxy(
  {},
  {
    get: (_, name) =>
      name === '~standard'
        ? { validate: (value) => Promise.resolve({ issues: null, value }) }
        : function () {
            return this;
          },
  }
);

// Placeholder export for 'react' module
export const cloneElement = {};
export const createElement = {};
