import type {
  ColorCluster,
  ColorHit,
  DefaultHit,
  Distance,
  RgbValue,
} from './types';

const colorDistance = (color1: ColorHit, color2: ColorHit) => {
  let result = 0;
  if (color1.rgb && color2.rgb) {
    for (let i = 0; i < color1.rgb.length; i++) {
      result +=
        (color1.rgb[i] - color2.rgb[i]) * (color1.rgb[i] - color2.rgb[i]);
    }
  }
  return result;
};

const sortByLabel = (items: ColorHit[]) => {
  return items.sort((a, b) => (a.label > b.label ? 1 : -1));
};

const sortByColors = (hits: ColorHit[]) => {
  const distances = hits.reduce((acc: Distance[], hit: ColorHit, i: number) => {
    for (let j = 0; j < i; j++)
      acc.push([hit, hits[j], colorDistance(hit, hits[j])]);
    return acc;
  }, []);

  distances.sort((a, b) => {
    return a[2] - b[2];
  });

  /* eslint-disable no-param-reassign */
  const colorToCluster = hits.reduce((acc: ColorCluster, hit: ColorHit) => {
    acc[hit.label] = [hit];
    return acc;
  }, {});

  /* eslint-enable no-param-reassign */
  return distances.reduce((acc: ColorHit[], distance: Distance) => {
    const color1 = distance[0];
    const color2 = distance[1];
    if (!color1 || !color2) return acc;

    let cluster1 = colorToCluster[color1.label];
    const cluster2 = colorToCluster[color2.label];
    if (!cluster1 || !cluster2 || cluster1 === cluster2) return acc;

    if (color1 !== cluster1[cluster1.length - 1]) cluster1.reverse();
    if (color2 !== cluster2[0]) cluster2.reverse();

    cluster1 = [...cluster1, ...cluster2];
    delete colorToCluster[color1.label];
    delete colorToCluster[color2.label];
    colorToCluster[cluster1[0].label] = cluster1;
    colorToCluster[cluster1[cluster1.length - 1].label] = cluster1;

    return cluster1;
  }, []);
};

const hexToRgb = (hex: string): RgbValue => {
  const hexCode = hex.replace(/#/, '');
  return [
    parseInt(hexCode.substring(0, 2), 16),
    parseInt(hexCode.substring(2, 4), 16),
    parseInt(hexCode.substring(4, 6), 16),
  ];
};

const parseHex = (hex: string) => {
  let parsedHex = hex.replace('#', ''); // Remove the number sign
  if (parsedHex.length === 3) {
    // If hex is a 3 digits, convert it to 6 digits
    parsedHex = parsedHex
      .split('')
      .map((digit: string) => digit + digit)
      .join('');
  }
  return `#${parsedHex}`;
};

const isHexCode = (value: string) => {
  return /^#([0-9A-F]{3}){1,2}$/i.test(value);
};

const parseItems = (items: DefaultHit[], separator: string): ColorHit[] => {
  for (let i = 0, l = items.length; i < l; i++) {
    const item = items[i] as ColorHit;

    if (!item.parsed) {
      item.parsed = true;

      const itemLabel = item.label;
      const separatorIndex = itemLabel.indexOf(separator);

      // If separator is not present, skip
      if (separatorIndex === -1) {
        throw new Error(
          `[ColorRefinementList] Unable to found 'separator' ('${separator}') in color value, expected format: 'black${separator}#000000', received: '${itemLabel}'.`
        );
      }

      // Split on the first separator only
      const labelParts = [
        itemLabel.slice(0, separatorIndex),
        itemLabel.slice(separatorIndex + separator.length),
      ];

      if (labelParts.length !== 2) {
        throw new Error(
          `[ColorRefinementList] Unable to parse color value, expected format: 'black${separator}#000000', received: '${itemLabel}'.`
        );
      }

      const [colorLabel, colorCode] = labelParts;
      if (!colorCode) continue; // eslint-disable-line no-continue

      // Detect if it's an URL or an hex code
      if (isHexCode(colorCode)) {
        item.hex = parseHex(colorCode);
        item.rgb = hexToRgb(item.hex);
      } else {
        item.url = colorCode;
      }
      item.label = colorLabel;
    }
  }

  return items as ColorHit[];
};

const getContrastColor = (
  bgColor: RgbValue,
  lightColor = '#ffffff',
  darkColor = '#000000'
) => {
  return bgColor[0] * 0.299 + bgColor[1] * 0.587 + bgColor[2] * 0.114 > 186
    ? darkColor
    : lightColor;
};

export {
  sortByLabel,
  sortByColors,
  hexToRgb,
  parseItems,
  parseHex,
  getContrastColor,
};
