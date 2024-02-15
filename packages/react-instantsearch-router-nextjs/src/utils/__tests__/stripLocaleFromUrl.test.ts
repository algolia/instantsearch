import { stripLocaleFromUrl } from '../stripLocaleFromUrl';

describe('stripLocaleFromUrl', () => {
  test('should not change the URL if no locale is provided', () => {
    expect(stripLocaleFromUrl('/search/frigidaire', undefined)).toBe(
      '/search/frigidaire'
    );
  });

  test('should remove the locale from the URL when there is no other path', () => {
    const locale = 'fr';
    expect(stripLocaleFromUrl('/fr', locale)).toBe('');
    expect(stripLocaleFromUrl('/fr/', locale)).toBe('/');
    expect(stripLocaleFromUrl('/fr?query=frigidaire', locale)).toBe(
      '?query=frigidaire'
    );
  });

  test('should remove the locale from the URL when there is a path', () => {
    const locale = 'fr';
    expect(stripLocaleFromUrl('/fr/search', locale)).toBe('/search');
    expect(stripLocaleFromUrl('/fr/search?query=frigidaire', locale)).toBe(
      '/search?query=frigidaire'
    );
  });

  test('should not remove part of the path that matches the locale', () => {
    const locale = 'fr';
    expect(stripLocaleFromUrl('/frigidaire', locale)).toBe('/frigidaire');
    expect(stripLocaleFromUrl('/fr/frigidaire', locale)).toBe('/frigidaire');
    expect(stripLocaleFromUrl('/fr/frigidaire?query=white', locale)).toBe(
      '/frigidaire?query=white'
    );
  });

  test('should not remove an unrelated locale', () => {
    const locale = 'fr';
    expect(stripLocaleFromUrl('/en/frigidaire', locale)).toBe('/en/frigidaire');
    expect(stripLocaleFromUrl('/en/frigidaire?query=white', locale)).toBe(
      '/en/frigidaire?query=white'
    );
  });
});
