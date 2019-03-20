import mapKeys from 'lodash/mapKeys';

function prefixKeys(prefix: string, obj: object) {
  if (obj) {
    return mapKeys(obj, (_0, key) => prefix + key);
  }

  return undefined;
}

export default prefixKeys;
