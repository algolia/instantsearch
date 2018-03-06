import createClassNames from './createClassNames';

describe('createClassNames', () => {
  it('expect to return classNames', () => {
    const cx = createClassNames('Widget');

    const actual = cx('', null, undefined, false, 'one', 'two').split(' ');
    const expectation = ['ais-Widget', 'ais-Widget-one', 'ais-Widget-two'];

    expect(actual).toEqual(expectation);
  });

  it('expect to return classNames with custom prefix', () => {
    const cx = createClassNames('Widget', 'ris');

    const actual = cx('', null, undefined, false, 'one', 'two').split(' ');
    const expectation = ['ris-Widget', 'ris-Widget-one', 'ris-Widget-two'];

    expect(actual).toEqual(expectation);
  });
});
