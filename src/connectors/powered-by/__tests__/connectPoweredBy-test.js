import connectPoweredBy from '../connectPoweredBy';

describe('connectPoweredBy', () => {
  it('renders during init and render', () => {
    const rendering = jest.fn();
    const makeWidget = connectPoweredBy(rendering);
    const widget = makeWidget();

    // does not have a getConfiguration method
    expect(widget.getConfiguration).toBe(undefined);

    widget.init();

    expect(rendering).toHaveBeenCalledTimes(1);
    expect(rendering).toHaveBeenCalledWith(expect.anything(), true);

    widget.render();

    expect(rendering).toHaveBeenCalledTimes(2);
    expect(rendering).toHaveBeenLastCalledWith(expect.anything(), false);
  });
});
