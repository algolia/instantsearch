/**
 * Merges user translations over their defaults, ignoring keys explicitly set
 * to `undefined`. A plain spread would let those overwrite the default, so
 * components would render an empty label or call a missing function.
 */
export function mergeTranslations<TTranslations extends object>(
  defaults: TTranslations,
  userTranslations?: Partial<NoInfer<TTranslations>>
): TTranslations {
  const merged = { ...defaults };

  if (userTranslations) {
    (Object.keys(userTranslations) as Array<keyof TTranslations>).forEach(
      (key) => {
        const value = userTranslations[key];
        if (value !== undefined) {
          merged[key] = value as TTranslations[keyof TTranslations];
        }
      }
    );
  }

  return merged;
}
