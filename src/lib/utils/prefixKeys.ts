import mapKeys from 'lodash/mapKeys';

function prefixKeys(prefix: string, obj: object): object | undefined {
  if (obj) {
    return mapKeys(obj, (_0, key) => prefix + key);
  }

  return undefined;
}

export default prefixKeys;
