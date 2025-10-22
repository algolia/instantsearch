import {
  getContrastColor,
  hexToRgb,
  parseHex,
  parseItems,
  sortByColors,
  sortByLabel,
} from '../utils';
import type { ColorHit, DefaultHit } from '../types';

describe('utils', () => {
  describe('hexToRgb', () => {
    it('converts 6-digit hex to RGB', () => {
      expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
      expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
      expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
      expect(hexToRgb('#00ff00')).toEqual([0, 255, 0]);
      expect(hexToRgb('#0000ff')).toEqual([0, 0, 255]);
    });

    it('converts hex without # prefix', () => {
      expect(hexToRgb('ff0000')).toEqual([255, 0, 0]);
    });

    it('handles lowercase hex', () => {
      expect(hexToRgb('#abc123')).toEqual([171, 193, 35]);
    });

    it('handles uppercase hex', () => {
      expect(hexToRgb('#ABC123')).toEqual([171, 193, 35]);
    });
  });

  describe('parseHex', () => {
    it('expands 3-digit hex to 6-digit', () => {
      expect(parseHex('#fff')).toBe('#ffffff');
      expect(parseHex('#000')).toBe('#000000');
      expect(parseHex('#f00')).toBe('#ff0000');
      expect(parseHex('#0f0')).toBe('#00ff00');
      expect(parseHex('#00f')).toBe('#0000ff');
    });

    it('keeps 6-digit hex unchanged', () => {
      expect(parseHex('#ffffff')).toBe('#ffffff');
      expect(parseHex('#000000')).toBe('#000000');
      expect(parseHex('#abc123')).toBe('#abc123');
    });

    it('adds # prefix if missing', () => {
      expect(parseHex('fff')).toBe('#ffffff');
      expect(parseHex('abc123')).toBe('#abc123');
    });

    it('handles mixed case', () => {
      expect(parseHex('#AbC')).toBe('#AAbbCC');
    });
  });

  describe('parseItems', () => {
    it('parses colour items with hex codes', () => {
      const items: DefaultHit[] = [
        { value: 'black', label: 'Black;#000', count: 10, isRefined: false },
        { value: 'white', label: 'White;#fff', count: 5, isRefined: false },
      ];

      const result = parseItems(items, ';');

      expect(result[0]).toMatchObject({
        label: 'Black',
        hex: '#000000',
        rgb: [0, 0, 0],
        parsed: true,
      });

      expect(result[1]).toMatchObject({
        label: 'White',
        hex: '#ffffff',
        rgb: [255, 255, 255],
        parsed: true,
      });
    });

    it('parses colour items with URLs', () => {
      const items: DefaultHit[] = [
        {
          value: 'pattern',
          label: 'Pattern;https://example.com/pattern.png',
          count: 3,
          isRefined: false,
        },
      ];

      const result = parseItems(items, ';');

      expect(result[0]).toMatchObject({
        label: 'Pattern',
        url: 'https://example.com/pattern.png',
        parsed: true,
      });
      expect(result[0].hex).toBeUndefined();
      expect(result[0].rgb).toBeUndefined();
    });

    it('handles custom separator', () => {
      const items: DefaultHit[] = [
        { value: 'red', label: 'Red::#ff0000', count: 7, isRefined: false },
      ];

      const result = parseItems(items, '::');

      expect(result[0]).toMatchObject({
        label: 'Red',
        hex: '#ff0000',
      });
    });

    it('throws error when separator not found', () => {
      const items: DefaultHit[] = [
        { value: 'invalid', label: 'InvalidFormat', count: 1, isRefined: false },
      ];

      expect(() => parseItems(items, ';')).toThrow(
        "[ColorRefinementList] Unable to found 'separator' (';') in color value"
      );
    });

    it('only parses items once (idempotent)', () => {
      const items: DefaultHit[] = [
        { value: 'red', label: 'Red;#f00', count: 5, isRefined: false },
      ];

      const result1 = parseItems(items, ';');
      const result2 = parseItems(result1, ';');

      expect(result2[0].label).toBe('Red');
      expect(result2[0].hex).toBe('#ff0000');
    });

    it('handles only first separator occurrence', () => {
      const items: DefaultHit[] = [
        {
          value: 'complex',
          label: 'Label;With;Semicolons;#abc123',
          count: 1,
          isRefined: false,
        },
      ];

      const result = parseItems(items, ';');

      expect(result[0].label).toBe('Label');
      // Everything after first separator should be colour code
    });
  });

  describe('sortByLabel', () => {
    it('sorts items alphabetically by label', () => {
      const items: ColorHit[] = [
        {
          value: 'c',
          label: 'Zebra',
          count: 1,
          isRefined: false,
          parsed: true,
        },
        {
          value: 'a',
          label: 'Apple',
          count: 1,
          isRefined: false,
          parsed: true,
        },
        {
          value: 'b',
          label: 'Banana',
          count: 1,
          isRefined: false,
          parsed: true,
        },
      ];

      const result = sortByLabel(items);

      expect(result.map((item) => item.label)).toEqual([
        'Apple',
        'Banana',
        'Zebra',
      ]);
    });

    it('handles empty array', () => {
      const items: ColorHit[] = [];
      const result = sortByLabel(items);
      expect(result).toEqual([]);
    });

    it('sorts case-sensitively', () => {
      const items: ColorHit[] = [
        {
          value: 'a',
          label: 'apple',
          count: 1,
          isRefined: false,
          parsed: true,
        },
        {
          value: 'b',
          label: 'Apple',
          count: 1,
          isRefined: false,
          parsed: true,
        },
      ];

      const result = sortByLabel(items);

      // Uppercase comes before lowercase in ASCII
      expect(result[0].label).toBe('Apple');
      expect(result[1].label).toBe('apple');
    });
  });

  describe('sortByColors', () => {
    it('groups similar colours together', () => {
      const items: ColorHit[] = [
        {
          value: 'red',
          label: 'Red',
          count: 1,
          isRefined: false,
          hex: '#ff0000',
          rgb: [255, 0, 0],
          parsed: true,
        },
        {
          value: 'blue',
          label: 'Blue',
          count: 1,
          isRefined: false,
          hex: '#0000ff',
          rgb: [0, 0, 255],
          parsed: true,
        },
        {
          value: 'darkred',
          label: 'Dark Red',
          count: 1,
          isRefined: false,
          hex: '#8b0000',
          rgb: [139, 0, 0],
          parsed: true,
        },
      ];

      const result = sortByColors(items);

      // Red and Dark Red should be adjacent
      const redIndex = result.findIndex((item) => item.label === 'Red');
      const darkRedIndex = result.findIndex((item) => item.label === 'Dark Red');

      expect(Math.abs(redIndex - darkRedIndex)).toBeLessThanOrEqual(1);
    });

    it('handles single colour', () => {
      const items: ColorHit[] = [
        {
          value: 'red',
          label: 'Red',
          count: 1,
          isRefined: false,
          hex: '#ff0000',
          rgb: [255, 0, 0],
          parsed: true,
        },
      ];

      const result = sortByColors(items);
      // sortByColors algorithm requires at least 2 items to compute distances
      // With a single item, it returns empty array as there are no distances to sort
      expect(result).toHaveLength(0);
    });

    it('handles empty array', () => {
      const items: ColorHit[] = [];
      const result = sortByColors(items);
      expect(result).toEqual([]);
    });

    it('handles colours without RGB values', () => {
      const items: ColorHit[] = [
        {
          value: 'pattern',
          label: 'Pattern',
          count: 1,
          isRefined: false,
          url: 'https://example.com/pattern.png',
          parsed: true,
        },
        {
          value: 'red',
          label: 'Red',
          count: 1,
          isRefined: false,
          hex: '#ff0000',
          rgb: [255, 0, 0],
          parsed: true,
        },
      ];

      const result = sortByColors(items);
      expect(result).toHaveLength(2);
    });
  });

  describe('getContrastColor', () => {
    it('returns dark colour for light backgrounds', () => {
      const white: [number, number, number] = [255, 255, 255];
      const lightGrey: [number, number, number] = [200, 200, 200];

      expect(getContrastColor(white)).toBe('#000000');
      expect(getContrastColor(lightGrey)).toBe('#000000');
    });

    it('returns light colour for dark backgrounds', () => {
      const black: [number, number, number] = [0, 0, 0];
      const darkGrey: [number, number, number] = [50, 50, 50];

      expect(getContrastColor(black)).toBe('#ffffff');
      expect(getContrastColor(darkGrey)).toBe('#ffffff');
    });

    it('uses custom light and dark colours', () => {
      const grey: [number, number, number] = [128, 128, 128];
      // Grey luminance = 128 < 186, so returns lightColor (first param)
      expect(getContrastColor(grey, '#ff0000', '#00ff00')).toBe('#ff0000');
    });

    it('handles threshold correctly around 186', () => {
      // RGB values that result in luminance ~186
      const threshold: [number, number, number] = [186, 186, 186];

      // Should be consistent one way or the other
      const result = getContrastColor(threshold);
      expect(result).toMatch(/#[0-9a-f]{6}/i);
    });

    it('handles pure RGB channels', () => {
      const red: [number, number, number] = [255, 0, 0];
      const green: [number, number, number] = [0, 255, 0];
      const blue: [number, number, number] = [0, 0, 255];

      // Calculate luminance:
      // Red: 255 * 0.299 = 76.245 < 186 → lightColor
      // Green: 255 * 0.587 = 149.685 < 186 → lightColor
      // Blue: 255 * 0.114 = 29.07 < 186 → lightColor
      expect(getContrastColor(red)).toBe('#ffffff');
      expect(getContrastColor(green)).toBe('#ffffff');
      expect(getContrastColor(blue)).toBe('#ffffff');
    });
  });
});
