type ClassValue = string | undefined | boolean | null | number;

export function cx(...classNames: Array<ClassValue | ClassValue[]>) {
  return classNames
    .reduce<ClassValue[]>((acc, className) => {
      if (Array.isArray(className)) {
        return acc.concat(className);
      }
      return acc.concat([className]);
    }, [])
    .filter(Boolean)
    .join(' ');
}
