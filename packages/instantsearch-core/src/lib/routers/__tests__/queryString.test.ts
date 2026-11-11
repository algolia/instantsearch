import qs from 'qs';

import { warning } from '../../utils';
import {
  parseQueryString,
  queryStringModule,
  stringifyQueryString,
} from '../queryString';

const parseWithQs = (search: string) => qs.parse(search, { arrayLimit: 99 });

const routeStates = [
  {},
  { query: 'iphone', page: 2 },
  {
    instant_search: {
      query: 'iphone case',
      page: 3,
      hitsPerPage: 16,
      sortBy: 'instant_search_price_asc',
      refinementList: {
        brand: ['Apple', 'Samsung'],
        categories: ['Cell Phones'],
      },
      hierarchicalMenu: {
        'hierarchicalCategories.lvl0': ['Audio > Headphones', 'Audio'],
      },
      menu: { categories: 'Appliances' },
      range: { price: '10:100' },
      numericMenu: { price: '10:' },
      ratingMenu: { rating: 4 },
      toggle: { free_shipping: true },
      geoSearch: { boundingBox: '47.3165,4.9665,47.3424,5.0201' },
      relevantSort: 0,
    },
    instant_search_price_asc: { query: 'iphone' },
  },
  { query: '100% cotton & "organic" + vegan, #1?' },
  {
    query: 'Größe 名前 🙂',
    refinementList: { 'brand name': ['AT&T', 'B&O Play'] },
  },
];

describe('stringifyQueryString', () => {
  it('writes the same query string as qs', () => {
    routeStates.forEach((routeState) => {
      expect(stringifyQueryString(routeState)).toBe(qs.stringify(routeState));
    });
  });

  it('writes nested keys and array indices in brackets', () => {
    expect(
      stringifyQueryString({
        instant_search: {
          query: 'iphone case',
          refinementList: { brand: ['Apple', 'Samsung'] },
        },
      })
    ).toBe(
      'instant_search%5Bquery%5D=iphone%20case&instant_search%5BrefinementList%5D%5Bbrand%5D%5B0%5D=Apple&instant_search%5BrefinementList%5D%5Bbrand%5D%5B1%5D=Samsung'
    );
  });

  it('encodes the characters that RFC 3986 reserves', () => {
    expect(stringifyQueryString({ query: "!'()*~-._" })).toBe(
      'query=%21%27%28%29%2A~-._'
    );
  });

  it('writes lone surrogates as U+FFFD', () => {
    expect(stringifyQueryString({ query: 'a\uD83Db' })).toBe(
      'query=a%EF%BF%BDb'
    );
  });

  it('writes null as an empty value and skips undefined and empty values', () => {
    expect(
      stringifyQueryString({ a: null, b: undefined, c: [], d: {}, e: '' })
    ).toBe('a=&e=');
  });

  it.each(['indices', 'brackets', 'repeat'] as const)(
    'writes arrays like qs with arrayFormat: %s',
    (arrayFormat) => {
      routeStates.forEach((routeState) => {
        [false, true].forEach((addQueryPrefix) => {
          expect(
            stringifyQueryString(routeState, { arrayFormat, addQueryPrefix })
          ).toBe(qs.stringify(routeState, { arrayFormat, addQueryPrefix }));
        });
      });
    }
  );

  it('writes the custom URLs of the routing guide', () => {
    expect(
      stringifyQueryString(
        { query: 'iphone case', page: 2, brands: ['Apple', 'Samsung'] },
        { addQueryPrefix: true, arrayFormat: 'repeat' }
      )
    ).toBe('?query=iphone%20case&page=2&brands=Apple&brands=Samsung');
    expect(stringifyQueryString({}, { addQueryPrefix: true })).toBe('');
  });

  it('writes dates as ISO strings', () => {
    expect(
      stringifyQueryString({ date: new Date(Date.UTC(2026, 10, 10)) })
    ).toBe('date=2026-11-10T00%3A00%3A00.000Z');
  });
});

describe('parseQueryString', () => {
  it('reads query strings like qs', () => {
    [
      ...routeStates.map((routeState) => stringifyQueryString(routeState)),
      'query=a+b%20c%2B',
      'refinementList[brand][0]=Apple&refinementList[brand][1]=Samsung',
      'refinementList%5bbrand%5d%5b0%5d=Apple',
      'refinementList[brand][]=Apple&refinementList[brand][]=Samsung',
      'refinementList[brand][1]=Samsung&refinementList[brand][0]=Apple',
      'brand=Apple&brand=Samsung',
      'a[b]=1&a[c][0]=2&a[c][1][d]=3',
      'query=%E0%A4%A&page=%',
      'query&page=',
      '&&query=iphone&&',
      '=empty&[]=a',
    ].forEach((search) => {
      expect(parseQueryString(search)).toStrictEqual(parseWithQs(search));
    });
  });

  it.each(['indices', 'brackets', 'repeat'] as const)(
    'reads the query strings of arrayFormat: %s like qs',
    (arrayFormat) => {
      routeStates.forEach((routeState) => {
        const search = qs.stringify(routeState, {
          arrayFormat,
          addQueryPrefix: true,
        });

        expect(
          parseQueryString(search, { ignoreQueryPrefix: true })
        ).toStrictEqual(
          qs.parse(search, { ignoreQueryPrefix: true, arrayLimit: 99 })
        );
      });
    }
  );

  it('reads the indices up to arrayLimit into arrays like qs', () => {
    const search = Array.from(
      { length: 30 },
      (_, index) => `brands[${index}]=brand-${index}`
    ).join('&');

    [0, 5, 20, 29, 99].forEach((arrayLimit) => {
      expect(parseQueryString(search, { arrayLimit })).toStrictEqual(
        qs.parse(search, { arrayLimit })
      );
    });
  });

  it('reads arrays of up to 100 items', () => {
    const brands = Array.from({ length: 100 }, (_, index) => `brand-${index}`);

    expect(parseQueryString(stringifyQueryString({ brands }))).toEqual({
      brands,
    });
    expect(
      parseQueryString(brands.map((brand) => `brands[]=${brand}`).join('&'))
    ).toEqual({ brands });
  });

  it('reads larger arrays and indices as objects', () => {
    const brands = Array.from({ length: 101 }, (_, index) => `brand-${index}`);

    expect(parseQueryString(stringifyQueryString({ brands }))).toEqual({
      brands: { ...brands },
    });
    expect(
      parseQueryString(brands.map((brand) => `brands=${brand}`).join('&'))
    ).toEqual({ brands: { ...brands } });
    expect(parseQueryString('brands[999999999]=a')).toEqual({
      brands: { 999999999: 'a' },
    });
  });

  it('ignores keys that name Object.prototype properties', () => {
    expect(
      parseQueryString(
        '__proto__[polluted]=1&constructor[prototype][polluted]=1&a[__proto__][polluted]=1&a[toString]=1&hasOwnProperty=1&b=2'
      )
    ).toStrictEqual({ b: '2' });
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('reads the levels after the fifth as a single key', () => {
    expect(parseQueryString('a[b][c][d][e][f][g][h]=i')).toStrictEqual({
      a: { b: { c: { d: { e: { f: { '[g][h]': 'i' } } } } } },
    });
  });

  it('reads the first 1000 parameters', () => {
    const search = Array.from(
      { length: 1001 },
      (_, index) => `p${index}=${index}`
    ).join('&');

    expect(Object.keys(parseQueryString(search))).toHaveLength(1000);
  });

  it('reads keys that contain brackets', () => {
    const routeState = { refinementList: { 'brand[0]': ['Apple'] } };

    expect(parseQueryString(stringifyQueryString(routeState))).toStrictEqual(
      routeState
    );
  });

  it('keeps both values when a key is used for a value and an object', () => {
    expect(parseQueryString('a[b]=1&a=2')).toStrictEqual({
      a: [{ b: '1' }, '2'],
    });
    expect(parseQueryString('a=2&a[b]=1')).toStrictEqual({
      a: ['2', { b: '1' }],
    });
  });
});

describe('compared with qs', () => {
  // A seeded generator (mulberry32), so failures can be reproduced.
  const createRandom = (seed: number) => {
    let state = seed;

    return () => {
      state = (state + 0x6d2b79f5) | 0;
      let value = Math.imul(state ^ (state >>> 15), 1 | state);
      value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  };

  it('writes and reads random route states like qs', () => {
    const random = createRandom(42);
    const pick = <TItem>(items: TItem[]) =>
      items[Math.floor(random() * items.length)];
    const randomString = () =>
      Array.from({ length: Math.floor(random() * 8) }, () =>
        pick([...'aZ0 -_.~!\'()*%+&=#?/[]"', 'é', '名', '🙂'])
      ).join('');
    // qs versions read empty, numeric and bracketed keys differently.
    const randomKey = () => {
      const key =
        random() < 0.7
          ? pick([
              'query',
              'page',
              'refinementList',
              'hierarchicalCategories.lvl0',
              'instant_search',
              'brand name',
              '名',
              '%',
              '+',
              '&',
              '=',
              'constructor',
              '__proto__',
              'toString',
            ])
          : randomString().replace(/[[\]]/g, '');

      return /^\d*$/.test(key) ? `key${key}` : key;
    };
    const randomObject = (depth: number) => {
      const object: Record<string, unknown> = {};

      for (let count = Math.floor(random() * 4); count >= 0; count--) {
        // `defineProperty` also creates own `__proto__` keys.
        Object.defineProperty(object, randomKey(), {
          value: randomValue(depth - 1),
          enumerable: true,
          writable: true,
          configurable: true,
        });
      }

      return object;
    };
    function randomValue(depth: number): unknown {
      const kind = random();

      if (depth > 0 && kind < 0.25) {
        return randomObject(depth);
      }
      if (depth > 0 && kind < 0.4) {
        return Array.from({ length: Math.floor(random() * 6) }, () =>
          randomValue(depth - 1)
        );
      }
      if (kind < 0.45) {
        return pick([null, undefined, [], {}]);
      }
      if (kind < 0.5) {
        return pick([0, 1.5, -2, 1e21, true, false]);
      }
      return randomString();
    }
    const mutate = (search: string) => {
      let parameters = search.split('&');
      if (random() < 0.3) {
        parameters = parameters.sort(() => random() - 0.5);
      }
      if (random() < 0.3) {
        parameters.push(pick(parameters));
      }

      let mutated = parameters.join('&');
      if (random() < 0.3) {
        mutated = mutated.replace(/%5B/g, '[').replace(/%5D/g, ']');
      }
      if (random() < 0.2) {
        mutated = mutated.replace(/%20/g, '+');
      }
      if (random() < 0.2) {
        mutated = mutated.replace(/%[0-9A-F]{2}/g, (escape) =>
          escape.toLowerCase()
        );
      }
      return mutated;
    };

    for (let iteration = 0; iteration < 500; iteration++) {
      const routeState = randomObject(6);
      const search = stringifyQueryString(routeState);
      const mutated = mutate(search);

      expect(search).toBe(qs.stringify(routeState));
      [
        { arrayFormat: pick(['indices', 'brackets', 'repeat'] as const) },
        { addQueryPrefix: true },
      ].forEach((options) => {
        expect(stringifyQueryString(routeState, options)).toBe(
          qs.stringify(routeState, options)
        );
      });
      expect({ search, parsed: parseQueryString(search) }).toStrictEqual({
        search,
        parsed: parseWithQs(search),
      });
      expect({ mutated, parsed: parseQueryString(mutated) }).toStrictEqual({
        mutated,
        parsed: parseWithQs(mutated),
      });
    }
  });

  it('reads malformed query strings as plain data', () => {
    const random = createRandom(7);
    const pieces = [
      'a',
      '0',
      '99',
      '100',
      '[',
      ']',
      '[]',
      '=',
      '&',
      '%5B',
      '%5d',
      '+',
      '%',
      '%E0%A4%A',
      '__proto__',
      'constructor',
      'prototype',
      'toString',
    ];
    const isPlainData = (value: unknown): boolean => {
      if (typeof value === 'string') {
        return true;
      }
      if (Array.isArray(value)) {
        return value.length <= 100 && value.every(isPlainData);
      }
      return (
        typeof value === 'object' &&
        value !== null &&
        Object.getPrototypeOf(value) === Object.prototype &&
        Object.keys(value).every(
          (key) =>
            !Object.prototype.hasOwnProperty.call(Object.prototype, key) &&
            isPlainData((value as Record<string, unknown>)[key])
        )
      );
    };

    for (let iteration = 0; iteration < 500; iteration++) {
      const search = Array.from(
        { length: 1 + Math.floor(random() * 30) },
        () => pieces[Math.floor(random() * pieces.length)]
      ).join('');

      expect({
        search,
        isPlainData: isPlainData(parseQueryString(search)),
      }).toEqual({
        search,
        isPlainData: true,
      });
    }

    expect(Object.keys(Object.prototype)).toEqual([]);
  });
});

describe('queryStringModule', () => {
  beforeEach(() => {
    warning.cache = {};
  });

  it('warns about the qs options it does not support', () => {
    expect(() =>
      // @ts-expect-error `encodeValuesOnly` is not supported
      queryStringModule.stringify({ a: 'b' }, { encodeValuesOnly: true })
    ).toWarnDev(
      "[InstantSearch.js]: `qsModule.stringify` doesn't support the `encodeValuesOnly` option of `qs`. To use it, import `qs` in your `createURL` and `parseURL` functions: `import qs from 'qs'`."
    );
    expect(() =>
      // @ts-expect-error only `indices`, `brackets` and `repeat` are supported
      queryStringModule.stringify({ a: ['b'] }, { arrayFormat: 'comma' })
    ).toWarnDev(
      "[InstantSearch.js]: `qsModule.stringify` doesn't support `arrayFormat: 'comma'` of `qs`. To use it, import `qs` in your `createURL` and `parseURL` functions: `import qs from 'qs'`."
    );
    expect(() =>
      // @ts-expect-error `allowDots` is not supported
      queryStringModule.parse('a.b=c', { allowDots: true })
    ).toWarnDev(
      "[InstantSearch.js]: `qsModule.parse` doesn't support the `allowDots` option of `qs`. To use it, import `qs` in your `createURL` and `parseURL` functions: `import qs from 'qs'`."
    );
  });

  it('does not warn about the options it supports', () => {
    expect(() => {
      queryStringModule.stringify(
        { a: ['b'] },
        { addQueryPrefix: true, arrayFormat: 'repeat' }
      );
      queryStringModule.parse('?a=b', {
        ignoreQueryPrefix: true,
        arrayLimit: 20,
      });
    }).not.toWarnDev();
  });
});
