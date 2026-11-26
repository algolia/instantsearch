import { takeClassName, takeRootClass } from '../rootClass';

describe('takeRootClass', () => {
  it('returns the class names untouched without a class binding', () => {
    const classNames = { root: 'own', container: 'inner' };

    expect(takeRootClass(classNames, { id: 'x' })).toEqual({
      classNames,
      attrs: { id: 'x' },
    });
  });

  it('appends a string class binding to the root class', () => {
    const { classNames, attrs } = takeRootClass(
      { root: 'own' },
      { class: 'extra', id: 'x' }
    );

    expect(classNames).toEqual({ root: 'own extra' });
    expect(attrs).toEqual({ id: 'x' });
  });

  it('keeps every entry of an array-valued root class', () => {
    // The shared factories accept `classNames.root` as a list. Joining it with
    // commas would leave `first,second` as a single class, matching neither.
    const { classNames } = takeRootClass(
      { root: ['first', 'second'] },
      { class: 'extra' }
    );

    expect(classNames.root.split(' ')).toEqual(['first', 'second', 'extra']);
  });

  it('leaves the class names alone without a class binding', () => {
    // Nothing to merge, so the list reaches the factory as a list, which is
    // what its own class composition expects.
    const classNames = { root: ['first', 'second'], container: 'inner' };

    expect(takeRootClass(classNames, {})).toEqual({ classNames, attrs: {} });
  });

  it('flattens the shapes a class binding comes in', () => {
    const { classNames } = takeRootClass(
      { root: ['first'] },
      { class: [{ object: true, absent: false }, 'array'] }
    );

    expect(classNames.root.split(' ')).toEqual(['first', 'object', 'array']);
  });

  it('creates the root class when there is none', () => {
    expect(takeRootClass(undefined, { class: 'extra' }).classNames).toEqual({
      root: 'extra',
    });
    expect(takeRootClass({}, { class: 'extra' }).classNames).toEqual({
      root: 'extra',
    });
  });
});

describe('takeClassName', () => {
  it('appends a class binding to a class name', () => {
    const { className, attrs } = takeClassName('own', {
      class: 'extra',
      inline: true,
    });

    expect(className).toBe('own extra');
    expect(attrs).toEqual({ inline: true });
  });

  it('keeps every entry of an array-valued class name', () => {
    const { className } = takeClassName(['first', 'second'], {
      class: 'extra',
    });

    expect(className.split(' ')).toEqual(['first', 'second', 'extra']);
  });

  it('returns the class name untouched without a class binding', () => {
    expect(takeClassName('own', { inline: true })).toEqual({
      className: 'own',
      attrs: { inline: true },
    });
  });
});
